
import { Download, FileText, Image, Share2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ExportModalProps {
  messages: Message[];
  chatTitle?: string;
}

export function ExportModal({ messages, chatTitle = "Chat Export" }: ExportModalProps) {
  const { toast } = useToast();

  const exportAsText = () => {
    const content = messages.map(msg => 
      `${msg.isUser ? 'You' : 'AI'} (${msg.timestamp.toLocaleString()}): ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatTitle}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported!",
      description: "Chat exported as text file",
    });
  };

  const exportAsJSON = () => {
    const content = JSON.stringify({ title: chatTitle, messages }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatTitle}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported!",
      description: "Chat exported as JSON file",
    });
  };

  const exportAsPDF = () => {
    const content = messages.map(msg => 
      `${msg.isUser ? 'You' : 'AI'} (${msg.timestamp.toLocaleString()}):\n${msg.content}\n\n`
    ).join('');
    
    // Create a simple HTML structure for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${chatTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .message { margin-bottom: 20px; padding: 10px; border-radius: 5px; }
            .user { background-color: #e3f2fd; text-align: right; }
            .ai { background-color: #f5f5f5; }
            .timestamp { font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${chatTitle}</h1>
          ${messages.map(msg => `
            <div class="message ${msg.isUser ? 'user' : 'ai'}">
              <div class="timestamp">${msg.isUser ? 'You' : 'AI'} - ${msg.timestamp.toLocaleString()}</div>
              <div>${msg.content}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatTitle}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported!",
      description: "Chat exported as HTML file (open in browser and print to PDF)",
    });
  };

  const exportAsExcel = () => {
    const csvContent = [
      ['Speaker', 'Message', 'Timestamp'],
      ...messages.map(msg => [
        msg.isUser ? 'You' : 'AI',
        msg.content.replace(/"/g, '""'), // Escape quotes for CSV
        msg.timestamp.toLocaleString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatTitle}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported!",
      description: "Chat exported as CSV file (open in Excel)",
    });
  };

  const copyToClipboard = async () => {
    const content = messages.map(msg => 
      `${msg.isUser ? 'You' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Chat copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (messages.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="border-white/20 opacity-50"
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 hover:border-white/30"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card neon-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Export Chat
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button
            onClick={exportAsText}
            className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/20"
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as Text (.txt)
          </Button>
          
          <Button
            onClick={exportAsPDF}
            className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/20"
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as PDF (.html)
          </Button>
          
          <Button
            onClick={exportAsExcel}
            className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/20"
            variant="outline"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export as Excel (.csv)
          </Button>
          
          <Button
            onClick={exportAsJSON}
            className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/20"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export as JSON (.json)
          </Button>
          
          <Button
            onClick={copyToClipboard}
            className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/20"
            variant="outline"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
