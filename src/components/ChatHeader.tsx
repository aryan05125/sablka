
import { useState, useEffect } from 'react';
import { User, LogOut, Moon, Sun, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SettingsModal } from './SettingsModal';

interface ChatHeaderProps {
  onLogout: () => void;
  userInfo: { name: string; email: string } | null;
}

export function ChatHeader({ onLogout, userInfo }: ChatHeaderProps) {
  const [isDark, setIsDark] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.style.setProperty('--background', '222.2 84% 4.9%');
      root.style.setProperty('--foreground', '210 40% 98%');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '222.2 84% 4.9%');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    applyTheme(newTheme);
  };

  return (
    <header className="h-16 bg-card/30 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-neon-gradient flex items-center justify-center animate-glow">
          <span className="text-black font-bold text-sm">K</span>
        </div>
        <h1 className="text-xl font-bold bg-neon-gradient bg-clip-text text-transparent">
          khudka.ai
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Settings */}
        <SettingsModal />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="hover:bg-white/10 transition-colors"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-yellow-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-400" />
          )}
        </Button>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={userInfo?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=00f5ff&color=000` : undefined} alt="User" />
            <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:block">
            {userInfo?.name || 'Guest User'}
          </span>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block ml-2">Logout</span>
        </Button>
      </div>
    </header>
  );
}
