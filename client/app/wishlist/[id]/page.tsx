'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  ExternalLink,
  ShoppingCart,
  CheckCircle,
  Clock,
  Gift,
  Mail,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { wishlistsAPI, itemsAPI } from '@/lib/api';
import { Wishlist, Item } from '@/lib/types';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import AddItemDialog from '@/components/AddItemDialog';
import EditItemDialog from '@/components/EditItemDialog';

export default function WishlistDetail() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const wishlistId = params.id as string;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && wishlistId) {
      fetchWishlist();
      fetchItems();
    }
  }, [isAuthenticated, wishlistId]);

  const fetchWishlist = async () => {
    try {
      console.log('🔍 Fetching wishlist with ID:', wishlistId);
      setLoadingWishlist(true);
      const response = await wishlistsAPI.getById(wishlistId);
      console.log('✅ Wishlist response:', response.data);
      setWishlist(response.data);  // Backend returns wishlist directly
    } catch (error: any) {
      console.error('❌ Error fetching wishlist:', error);
      console.error('❌ Error response:', error.response);
      toast.error(error.response?.data?.error || 'Failed to load wishlist');
      router.push('/dashboard');
    } finally {
      setLoadingWishlist(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const response = await itemsAPI.getAll(wishlistId);
      setItems(response.data || []);  // Backend returns items directly
    } catch (error: any) {
      console.error('Error fetching items:', error);
      toast.error(error.response?.data?.error || 'Failed to load items');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAddItem = async (itemData: any) => {
    try {
      const response = await itemsAPI.create(wishlistId, itemData);
      setItems(prev => [response.data.item, ...prev]);
      toast.success('Item added successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add item');
      throw error;
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setInviteLoading(true);
      await wishlistsAPI.invite(wishlistId, inviteEmail);
      toast.success(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
      setShowInviteInput(false);
      // Refresh wishlist to show new member
      fetchWishlist();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await itemsAPI.delete(wishlistId, itemId);
      setItems(prev => prev.filter(item => item._id !== itemId));
      toast.success('Item deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete item');
    }
  };

  const handleClaimItem = async (itemId: string) => {
    try {
      await itemsAPI.claim(wishlistId, itemId);
      // Refresh items to show updated status
      fetchItems();
      toast.success('Item claimed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to claim item');
    }
  };

  const handleEditItem = async (itemId: string, itemData: any) => {
    try {
      const response = await itemsAPI.update(wishlistId, itemId, itemData);
      setItems(prev => prev.map(item => 
        item._id === itemId ? { ...item, ...response.data.item } : item
      ));
      toast.success('Item updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update item');
      throw error;
    }
  };

  const openEditDialog = (item: Item) => {
    setEditingItem(item);
    setShowEditItemDialog(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'purchased': return 'bg-green-100 text-green-800 border-green-200';
      case 'claimed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'available': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Check if current user is owner or admin
  const isOwner = wishlist?.ownerId._id === user?._id;
  const isAdmin = wishlist?.members?.some(member => 
    member.userId._id === user?._id && member.role === 'admin'
  );
  const canManage = isOwner || isAdmin;

  if (isLoading || loadingWishlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Wishlist not found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="bg-white/80 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{wishlist.name}</h1>
              {wishlist.description && (
                <p className="text-gray-600 mt-1">{wishlist.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={wishlist.isPublic ? "default" : "secondary"}
              className="bg-white/80 backdrop-blur-sm"
            >
              {wishlist.isPublic ? 'Public' : 'Private'}
            </Badge>
            {wishlist.members && wishlist.members.length > 0 && (
              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                <Users className="w-3 h-3 mr-1" />
                {wishlist.members.length + 1} members
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={() => setShowAddItemDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          
          {canManage && (
            <Button
              variant="outline"
              onClick={() => setShowInviteInput(!showInviteInput)}
              className="bg-white/80 backdrop-blur-sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Invite Input */}
        {showInviteInput && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Input
                  type="email"
                  placeholder="Enter email address to invite"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-white/50 border-gray-300 focus:border-blue-500"
                />
                <Button
                  onClick={handleInviteUser}
                  disabled={inviteLoading || !inviteEmail.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {inviteLoading ? 'Sending...' : 'Send Invite'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteInput(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wishlist Info */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchased</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {items.filter(item => item.status === 'purchased').length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {items.filter(item => item.status === 'available').length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingItems ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items yet</h3>
              <p className="text-gray-600 mb-6">Add your first item to get started!</p>
              <Button 
                onClick={() => setShowAddItemDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <Card key={item._id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  {/* Item Image */}
                  {item.imageUrl && (
                    <div className="relative mb-4">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <Badge className={getPriorityColor(item.priority || 'medium')}>
                          {item.priority || 'medium'}
                        </Badge>
                        <Badge className={getStatusColor(item.status || 'available')}>
                          {item.status || 'available'}
                        </Badge>
                      </div>
                      {/* Actions Menu */}
                      {(canManage || item.addedBy?._id === user?._id) && (
                        <div className="absolute top-2 left-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteItem(item._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {/* Item Details */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    
                    {/* Price */}
                    {item.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          {item.currency || '$'}{item.price}
                        </span>
                      </div>
                    )}

                    {/* Added By Info */}
                    {item.addedBy && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={item.addedBy.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {item.addedBy.displayName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>Added by {item.addedBy.displayName}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      {item.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </a>
                        </Button>
                      )}
                      
                      {item.status === 'available' && item.addedBy?._id !== user?._id && (
                        <Button 
                          size="sm" 
                          onClick={() => handleClaimItem(item._id)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Claim
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        onSubmit={handleAddItem}
      />

      {/* Edit Item Dialog */}
      <EditItemDialog
        open={showEditItemDialog}
        onOpenChange={setShowEditItemDialog}
        item={editingItem}
        onSubmit={handleEditItem}
      />
    </div>
  );
}
