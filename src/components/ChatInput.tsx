
import { useState, useRef } from 'react';
import { Send, Paperclip, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setMessage(prev => prev + (prev ? '\n' : '') + `[File: ${file.name}]`);
      toast({
        title: "File attached",
        description: `${file.name} has been attached to your message`,
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setMessage(prev => prev + (prev ? '\n' : '') + '[Voice message recorded]');
        toast({
          title: "Voice recorded",
          description: "Voice message has been added to your text",
        });
        
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      toast({
        title: "Recording...",
        description: "Speak your message, click again to stop",
      });
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="sticky bottom-0 p-2 sm:p-4 bg-background/80 backdrop-blur-md border-t border-white/10">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="glass-card neon-border rounded-2xl p-2 sm:p-4">
          <div className="flex items-end gap-2 sm:gap-3">
            {/* File Upload */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileUpload}
              className="hover:bg-white/10 flex-shrink-0 p-2"
              disabled={disabled}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />

            {/* Text Input */}
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="min-h-[40px] max-h-32 resize-none bg-transparent border-none focus-visible:ring-0 text-sm sm:text-base"
                disabled={disabled}
              />
            </div>

            {/* Voice Recording */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleRecording}
              className={`hover:bg-white/10 flex-shrink-0 p-2 ${isRecording ? 'bg-red-500/20 text-red-400' : ''}`}
              disabled={disabled}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={!message.trim() || disabled}
              className="bg-neon-gradient hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] transition-all duration-300 flex-shrink-0 p-2 sm:px-4"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Send</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
