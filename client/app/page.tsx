'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Users, Share2, Heart, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50">
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md bg-white/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WishShare
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Login
            </Button>
            <Button onClick={() => router.push('/signup')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Collaborative Wishlist Platform
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
            Share Your Dreams,
            <br />
            Make Them Reality
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create beautiful wishlists, collaborate with friends and family, and never miss a special moment. 
            Real-time updates keep everyone in sync.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Button 
              size="lg" 
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg"
            >
              Create Your First Wishlist
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => router.push('/login')}
              className="border-2 border-gray-300 hover:border-gray-400 px-8 py-6 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Everything You Need for Perfect Wishlists
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make wishlist creation and sharing delightful
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Real-time Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-center">
                Invite friends and family to collaborate on wishlists. See updates instantly as items are added, claimed, or purchased.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Easy Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-center">
                Share your wishlists with a simple email invitation. Control who can view and edit your lists.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Beautiful Design</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-center">
                Gorgeous, responsive design that works perfectly on all devices. Customize colors and themes to match your style.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Sharing?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already creating amazing wishlists together.
          </p>
          <Button 
            size="lg"
            onClick={() => router.push('/signup')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 backdrop-blur-md bg-white/30 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Gift className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold">WishShare</span>
          </div>
          <p>&copy; 2024 WishShare. Made with ❤️ for better gift-giving.</p>
        </div>
      </footer>
    </div>
  );
}