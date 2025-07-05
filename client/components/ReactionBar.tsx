'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { itemsAPI } from '@/lib/api';
import socketManager from '@/lib/socket';

interface ReactionUser {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
}

interface Reaction {
  _id: string;
  user: ReactionUser;
  emoji: string;
  createdAt: string;
}

interface ReactionBarProps {
  itemId: string;
  wishlistId: string;
  reactions: Reaction[];
  onReactionsUpdate: (reactions: Reaction[]) => void;
}

const AVAILABLE_EMOJIS = ['👍', '❤️', '😍', '🔥', '👏', '😂', '😮', '😢', '🎉', '💯'];

export default function ReactionBar({
  itemId,
  wishlistId,
  reactions,
  onReactionsUpdate
}: ReactionBarProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen for real-time reaction events
    const handleReactionUpdated = (data: any) => {
      if (data.itemId === itemId) {
        // Update or add the reaction
        const updatedReactions = reactions.filter(r => r.user._id !== data.addedBy);
        onReactionsUpdate([...updatedReactions, data.reaction]);
      }
    };

    const handleReactionRemoved = (data: any) => {
      if (data.itemId === itemId) {
        onReactionsUpdate(reactions.filter(r => r.user._id !== data.removedBy));
      }
    };

    socketManager.onReactionUpdated(handleReactionUpdated);
    socketManager.onReactionRemoved(handleReactionRemoved);

    return () => {
      socketManager.offReactionUpdated(handleReactionUpdated);
      socketManager.offReactionRemoved(handleReactionRemoved);
    };
  }, [itemId, reactions, onReactionsUpdate]);

  const handleReaction = async (emoji: string) => {
    try {
      await itemsAPI.addReaction(wishlistId, itemId, { emoji });
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add reaction');
    }
  };

  const handleRemoveReaction = async () => {
    try {
      await itemsAPI.removeReaction(wishlistId, itemId);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove reaction');
    }
  };

  // Get user's current reaction
  const userReaction = reactions.find(r => r.user._id === user?._id);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  return (
    <div className="flex items-center space-x-2 flex-wrap">
      {/* Display grouped reactions */}
      {Object.entries(groupedReactions).map(([emoji, emojiReactions]) => (
        <Popover key={emoji}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 px-2 space-x-1 hover:bg-blue-50 ${
                emojiReactions.some(r => r.user._id === user?._id) 
                  ? 'bg-blue-100 border-blue-300' 
                  : 'bg-white'
              }`}
            >
              <span className="text-base">{emoji}</span>
              <span className="text-xs font-medium">{emojiReactions.length}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <span className="text-lg">{emoji}</span>
                <span>{emojiReactions.length} {emojiReactions.length === 1 ? 'person' : 'people'}</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {emojiReactions.map((reaction) => (
                  <div key={reaction._id} className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={reaction.user.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {reaction.user.displayName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{reaction.user.displayName}</span>
                    {reaction.user._id === user?._id && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ))}

      {/* Add/Remove Reaction Button */}
      {userReaction ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveReaction}
          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Remove
        </Button>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 hover:bg-blue-50"
            >
              <span className="text-sm">😊</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3">
            <div className="space-y-3">
              <div className="text-sm font-medium">Choose a reaction</div>
              <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(emoji)}
                    className="h-10 w-10 p-0 text-xl hover:bg-blue-50"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
