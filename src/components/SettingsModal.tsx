
import { useState } from 'react';
import { Settings, X, Volume2, VolumeX, Type, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function SettingsModal() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [typingSpeed, setTypingSpeed] = useState('medium');

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('sound-enabled', enabled.toString());
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem('font-size', size);
    // Apply font size to document
    document.documentElement.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
  };

  const handleTypingSpeedChange = (speed: string) => {
    setTypingSpeed(speed);
    localStorage.setItem('typing-speed', speed);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-white/10">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card neon-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sound Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Sound
            </Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Message sound</span>
              <Switch
                checked={soundEnabled}
                onCheckedChange={handleSoundToggle}
              />
            </div>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              Font Size
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {['small', 'medium', 'large'].map((size) => (
                <Button
                  key={size}
                  variant={fontSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFontSizeChange(size)}
                  className={fontSize === size ? "bg-neon-gradient" : "border-white/20"}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Typing Speed */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Typing Speed
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {['slow', 'medium', 'fast'].map((speed) => (
                <Button
                  key={speed}
                  variant={typingSpeed === speed ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTypingSpeedChange(speed)}
                  className={typingSpeed === speed ? "bg-neon-gradient" : "border-white/20"}
                >
                  {speed.charAt(0).toUpperCase() + speed.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
