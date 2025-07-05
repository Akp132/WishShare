'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Gift, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Heart,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { wishlistsAPI } from '@/lib/api';
import { Wishlist } from '@/lib/types';
import { toast } from 'sonner';
import CreateWishlistDialog from '@/components/CreateWishlistDialog';
import { formatDistanceToNow } from 'date-fns';
import socketManager from '@/lib/socket';

export default function Dashboard() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loadingWishlists, setLoadingWishlists] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlists();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // Set up socket listeners
      socketManager.onWishlistUpdated((data) => {
        setWishlists(prev => 
          prev.map(w => w._id === data.wishlist._id ? data.wishlist : w)
        );
      });

      // Clean up on unmount
      return () => {
        socketManager.off('wishlist_updated', () => {});
      };
    }
  }, [isAuthenticated]);

  const fetchWishlists = async () => {
    try {
      const response = await wishlistsAPI.getAll();
      setWishlists(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch wishlists');
    } finally {
      setLoadingWishlists(false);
    }
  };

  const handleCreateWishlist = async (data: any) => {
    try {
      const response = await wishlistsAPI.create(data);
      setWishlists(prev => [response.data.wishlist, ...prev]);
      setShowCreateDialog(false);
      toast.success('Wishlist created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create wishlist');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || loadingWishlists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlists...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const ownedWishlists = wishlists.filter(w => w.ownerId._id === user?._id);
  const sharedWishlists = wishlists.filter(w => w.ownerId._id !== user?._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50">
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md bg-white/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Gift className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WishShare
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar className="w-10 h-10 ring-2 ring-blue-200">
                <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {user?.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">{user?.displayName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Wishlists</p>
                  <p className="text-3xl font-bold text-blue-600">{ownedWishlists.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shared with You</p>
                  <p className="text-3xl font-bold text-purple-600">{sharedWishlists.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {wishlists.reduce((sum, w) => sum + (w.itemCount || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Wishlist
            </Button>
          </div>
        </div>

        {/* Wishlists */}
        <div className="space-y-8">
          {/* Your Wishlists */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Wishlists</h2>
            {ownedWishlists.length === 0 ? (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No wishlists yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first wishlist to get started!
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Wishlist
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedWishlists.map((wishlist) => (
                  <Card
                    key={wishlist._id}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/70 backdrop-blur-sm border-0 shadow-lg"
                    onClick={() => router.push(`/wishlist/${wishlist._id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: wishlist.color }}
                        />
                        <Badge variant="secondary" className="text-xs">
                          {wishlist.itemCount || 0} items
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {wishlist.name}
                      </CardTitle>
                      {wishlist.description && (
                        <CardDescription className="text-sm text-gray-600">
                          {wishlist.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{wishlist.members.length} members</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDistanceToNow(new Date(wishlist.updatedAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Shared Wishlists */}
          {sharedWishlists.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shared with You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedWishlists.map((wishlist) => (
                  <Card
                    key={wishlist._id}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/70 backdrop-blur-sm border-0 shadow-lg"
                    onClick={() => router.push(`/wishlist/${wishlist._id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: wishlist.color }}
                        />
                        <Badge variant="secondary" className="text-xs">
                          {wishlist.itemCount || 0} items
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                        {wishlist.name}
                      </CardTitle>
                      {wishlist.description && (
                        <CardDescription className="text-sm text-gray-600">
                          {wishlist.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{wishlist.members.length} members</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDistanceToNow(new Date(wishlist.updatedAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>by</span>
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={wishlist.ownerId.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {wishlist.ownerId.displayName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{wishlist.ownerId.displayName}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Wishlist Dialog */}
      <CreateWishlistDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateWishlist}
      />
    </div>
  );
}