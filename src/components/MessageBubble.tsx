
import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
  };
  isTyping?: boolean;
}

export function MessageBubble({ message, isTyping = false }: MessageBubbleProps) {
  const { content, isUser, timestamp } = message;

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fade-in">
        <div className="flex items-end gap-2 max-w-[70%]">
          <div className="bg-neon-gradient p-3 rounded-2xl rounded-br-md">
            <p className="text-black font-medium text-sm">{content}</p>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="flex items-end gap-2 max-w-[70%]">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-purple-500/20 text-purple-400">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="glass-card neon-border p-3 rounded-2xl rounded-bl-md">
          {isTyping ? (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-typing" />
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
            </div>
          ) : (
            <div>
              <p className="text-sm whitespace-pre-wrap">{content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {timestamp.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
