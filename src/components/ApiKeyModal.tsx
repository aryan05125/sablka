
import { useState } from 'react';
import { Key, Eye, EyeOff, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveApiKey: (apiKey: string) => void;
  currentApiKey?: string;
}

export function ApiKeyModal({ isOpen, onClose, onSaveApiKey, currentApiKey }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    onSaveApiKey(apiKey);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card neon-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-neon-cyan" />
            Add Your Gemini API Key
          </DialogTitle>
          <DialogDescription>
            Enter your Google Gemini API key to start chatting with AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <AlertDescription className="text-sm">
              🔒 Your API key is stored locally and never sent to our servers
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="apikey">API Key</Label>
            <div className="relative">
              <Input
                id="apikey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="bg-white/5 border-white/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">How to get your API key:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Visit Google AI Studio</li>
              <li>Create a new API key</li>
              <li>Copy and paste it here</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-neon-cyan/30 hover:border-neon-cyan/50"
              onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get API Key
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!apiKey.trim()}
              className="flex-1 bg-neon-gradient hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]"
            >
              Save API Key
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
