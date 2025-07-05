'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function Signup() {
  console.log('🎨 Signup component rendering...');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  
  console.log('📊 Component state:', { email, displayName, password: password ? '***' : 'empty', isLoading });
  console.log('🔧 Auth context signup function:', signup ? 'exists' : 'missing');

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🎯 handleSubmit called');
    e.preventDefault();
    
    console.log('📝 Form data:', { email, displayName, password: password ? '***' : 'empty' });
    
    if (password.length < 6) {
      console.log('❌ Password too short');
      toast.error('Password must be at least 6 characters');
      return;
    }

    console.log('⏳ Setting loading state...');
    setIsLoading(true);

    try {
      console.log('🚀 About to call signup function...');
      await signup(email, password, displayName);
      console.log('✅ Signup successful, showing toast...');
      toast.success('Account created successfully!');
      console.log('🔄 Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Signup error in handleSubmit:', error);
      toast.error(error.message || 'Signup failed');
    } finally {
      console.log('🏁 Setting loading to false');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Join WishShare
            </CardTitle>
            <CardDescription className="text-gray-600">
              Create your account and start sharing wishlists
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { console.log('📝 Form onSubmit fired!'); handleSubmit(e); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              onClick={() => console.log('🔘 Button clicked!')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}