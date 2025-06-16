
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginPageProps {
  onLogin: (userInfo: { name: string; email: string }) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID
          callback: handleGoogleResponse,
        });
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleGoogleResponse = (response: any) => {
    try {
      const token = response.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userInfo = {
        name: payload.name || payload.given_name || 'Google User',
        email: payload.email
      };
      
      onLogin(userInfo);
      toast({
        title: "Success!",
        description: `Welcome ${userInfo.name}! You're now logged in with Google.`,
      });
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Login Error",
        description: "Failed to login with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      const userInfo = {
        name: email.split('@')[0],
        email: email
      };
      onLogin(userInfo);
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      // Fallback for demo purposes
      setIsLoading(true);
      setTimeout(() => {
        const userInfo = {
          name: "Demo User",
          email: "demo@gmail.com"
        };
        onLogin(userInfo);
        setIsLoading(false);
        toast({
          title: "Demo Mode",
          description: "Logged in with demo account (Google API not configured)",
        });
      }, 1000);
    }
  };

  const handleGuestLogin = () => {
    const userInfo = {
      name: "Guest User",
      email: "guest@khudka.ai"
    };
    onLogin(userInfo);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-40 h-40 sm:w-80 sm:h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="glass-card neon-border w-full max-w-md relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-neon-gradient rounded-2xl flex items-center justify-center animate-glow">
            <span className="text-black font-bold text-lg sm:text-2xl">K</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Welcome to khudka.ai
          </CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base">
            Talk with AI like never before – for free!
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google Login Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-black border border-gray-300 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] text-sm sm:text-base"
          >
            <Chrome className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Continue with Google
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs sm:text-sm text-muted-foreground">
              or
            </span>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-sm sm:text-base"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neon-gradient hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] transition-all duration-300 text-sm sm:text-base"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={handleGuestLogin}
              className="text-neon-cyan hover:text-neon-cyan/80 text-sm sm:text-base"
            >
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
