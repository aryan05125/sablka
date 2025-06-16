
import { useState } from 'react';
import { MessageSquarePlus, History, Settings, Key, Lightbulb, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ChatSidebarProps {
  onNewChat: () => void;
  onShowApiKeyModal: () => void;
  chatHistory: Array<{ id: string; title: string; preview: string; timestamp: Date }>;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

const tips = [
  "Ask specific questions for better AI responses",
  "Use clear context in your prompts",
  "Try follow-up questions for deeper insights",
  "Break complex questions into smaller parts"
];

export function ChatSidebar({ 
  onNewChat, 
  onShowApiKeyModal, 
  chatHistory, 
  onSelectChat,
  onDeleteChat 
}: ChatSidebarProps) {
  const [currentTip, setCurrentTip] = useState(0);

  const handleNewChat = () => {
    onNewChat();
  };

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  return (
    <div className="w-80 h-full bg-card/50 backdrop-blur-md border-r border-white/10 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={handleNewChat}
          className="w-full bg-neon-gradient hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Chat History</span>
        </div>
        
        <div className="space-y-2">
          {chatHistory.map((chat) => (
            <Card 
              key={chat.id}
              className="glass-card p-3 cursor-pointer hover:bg-white/10 transition-all duration-200 group"
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{chat.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{chat.preview}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {chat.timestamp.toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-3">
        {/* Tip of the Day */}
        <Card className="glass-card p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Tip of the Day</p>
              <p className="text-sm">{tips[currentTip]}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextTip}
                className="text-xs mt-1 h-6 px-2 text-primary hover:text-primary"
              >
                Next tip
              </Button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShowApiKeyModal}
            className="w-full justify-start border-neon-cyan/30 hover:border-neon-cyan/50 hover:bg-neon-cyan/10"
          >
            <Key className="w-4 h-4 mr-2" />
            Add API Key
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start border-white/20 hover:border-white/30"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
