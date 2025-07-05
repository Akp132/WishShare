'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Send, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { itemsAPI } from '@/lib/api';
import socketManager from '@/lib/socket';

interface CommentUser {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
}

interface Comment {
  _id: string;
  user: CommentUser;
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  itemId: string;
  wishlistId: string;
  comments: Comment[];
  onCommentsUpdate: (comments: Comment[]) => void;
}

export default function CommentSection({
  itemId,
  wishlistId,
  comments,
  onCommentsUpdate
}: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    // Listen for real-time comment events
    const handleCommentAdded = (data: any) => {
      console.log('📝 CommentSection received comment_added:', data);
      if (data.itemId === itemId) {
        // Don't add if comment already exists (to prevent duplicates)
        const commentExists = comments.some(c => c._id === data.comment._id);
        if (!commentExists) {
          onCommentsUpdate([...comments, data.comment]);
        }
      }
    };

    const handleCommentDeleted = (data: any) => {
      console.log('🗑️ CommentSection received comment_deleted:', data);
      if (data.itemId === itemId) {
        onCommentsUpdate(comments.filter(comment => comment._id !== data.commentId));
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.itemId === itemId && data.userId !== user?._id) {
        if (data.isTyping) {
          setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
      }
    };

    socketManager.onCommentAdded(handleCommentAdded);
    socketManager.onCommentDeleted(handleCommentDeleted);
    socketManager.onUserTypingComment(handleUserTyping);

    return () => {
      socketManager.offCommentAdded(handleCommentAdded);
      socketManager.offCommentDeleted(handleCommentDeleted);
      socketManager.offUserTypingComment(handleUserTyping);
    };
  }, [itemId, comments, onCommentsUpdate, user?._id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await itemsAPI.addComment(wishlistId, itemId, { text: newComment.trim() });
      setNewComment('');
      
      // Emit typing stopped
      socketManager.emitTypingComment(wishlistId, itemId, user?._id || '', false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await itemsAPI.deleteComment(wishlistId, itemId, commentId);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete comment');
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (user?._id) {
      socketManager.emitTypingComment(wishlistId, itemId, user._id, isTyping);
    }
  };

  return (
    <div className="space-y-3">
      {/* Comment Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="text-gray-600 hover:text-gray-900"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </Button>

      {showComments && (
        <Card className="bg-gray-50">
          <CardContent className="p-4 space-y-4">
            {/* Add Comment Form */}
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {user?.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onFocus={() => handleTyping(true)}
                    onBlur={() => handleTyping(false)}
                    placeholder="Add a comment..."
                    className="min-h-[80px] bg-white border-gray-300 focus:border-blue-500"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/500
                    </span>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newComment.trim() || isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="text-xs text-gray-500 italic">
                Someone is typing...
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.user.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {comment.user.displayName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-white rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-gray-900">
                            {comment.user.displayName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                          {comment.text}
                        </p>
                      </div>
                      
                      {/* Delete Button for Comment Owner */}
                      {comment.user._id === user?._id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
