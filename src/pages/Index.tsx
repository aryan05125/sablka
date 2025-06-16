import { useState, useEffect } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatSidebar } from '@/components/ChatSidebar';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { LoginPage } from '@/components/LoginPage';
import { ExportModal } from '@/components/ExportModal';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: Message[];
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{name: string, email: string} | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Check authentication on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('user-authenticated');
    const savedUserInfo = localStorage.getItem('user-info');
    
    if (savedAuth === 'true' && savedUserInfo) {
      setIsAuthenticated(true);
      setUserInfo(JSON.parse(savedUserInfo));
    }
  }, []);

  // Load API key and chat history from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const savedApiKey = localStorage.getItem('gemini-api-key');
    const savedChatHistory = localStorage.getItem('chat-history');
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    if (savedChatHistory) {
      try {
        const parsedHistory = JSON.parse(savedChatHistory);
        setChatHistory(parsedHistory.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })));
      } catch (error) {
        console.error('Error parsing chat history:', error);
      }
    }
  }, [isAuthenticated]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chat-history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleLogin = (userInfo: {name: string, email: string}) => {
    setIsAuthenticated(true);
    setUserInfo(userInfo);
    localStorage.setItem('user-authenticated', 'true');
    localStorage.setItem('user-info', JSON.stringify(userInfo));
    toast({
      title: "Welcome!",
      description: `Hello ${userInfo.name}, you're now logged in.`,
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    setMessages([]);
    setChatHistory([]);
    setCurrentChatId(null);
    setIsSidebarOpen(false);
    localStorage.removeItem('user-authenticated');
    localStorage.removeItem('user-info');
    localStorage.removeItem('chat-history');
    localStorage.removeItem('gemini-api-key');
    setApiKey('');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const generateChatTitle = (firstMessage: string): string => {
    return firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
  };

  const callGeminiAPI = async (message: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('API key not found');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setIsSidebarOpen(false); // Close sidebar on mobile after sending

    try {
      const aiResponse = await callGeminiAPI(messageContent);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update or create chat session
      const updatedMessages = [...messages, userMessage, aiMessage];
      const chatTitle = messages.length === 0 ? generateChatTitle(messageContent) : 
        chatHistory.find(chat => chat.id === currentChatId)?.title || generateChatTitle(messageContent);

      if (currentChatId) {
        // Update existing chat
        setChatHistory(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: updatedMessages, preview: messageContent }
            : chat
        ));
      } else {
        // Create new chat
        const newChatId = Date.now().toString();
        const newChat: ChatSession = {
          id: newChatId,
          title: chatTitle,
          preview: messageContent,
          timestamp: new Date(),
          messages: updatedMessages,
        };
        setChatHistory(prev => [newChat, ...prev]);
        setCurrentChatId(newChatId);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setIsSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setMessages([]);
      setCurrentChatId(null);
    }
  };

  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('gemini-api-key', newApiKey);
    toast({
      title: "Success",
      description: "API key saved successfully!",
    });
  };

  const handleClearChat = () => {
    setMessages([]);
    if (currentChatId) {
      setChatHistory(prev => prev.filter(chat => chat.id !== currentChatId));
      setCurrentChatId(null);
    }
  };

  const handleRegenerateResponse = async () => {
    if (messages.length === 0) return;
    
    const lastUserMessage = [...messages].reverse().find(msg => msg.isUser);
    if (lastUserMessage) {
      const messagesWithoutLastAI = messages.filter((msg, index) => 
        !(index === messages.length - 1 && !msg.isUser)
      );
      setMessages(messagesWithoutLastAI);
      
      await handleSendMessage(lastUserMessage.content);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <ChatHeader onLogout={handleLogout} userInfo={userInfo} />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:relative z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          w-80 lg:w-80 h-full lg:h-auto
        `}>
          <ChatSidebar 
            onNewChat={handleNewChat}
            onShowApiKeyModal={() => setIsApiKeyModalOpen(true)}
            chatHistory={chatHistory}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
          />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center p-4 border-b border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-white/10"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <span className="ml-2 text-sm text-muted-foreground">
              {currentChatId ? chatHistory.find(chat => chat.id === currentChatId)?.title || 'Chat' : 'New Chat'}
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4 p-4">
                    <div className="w-16 h-16 mx-auto bg-neon-gradient rounded-2xl flex items-center justify-center animate-glow">
                      <span className="text-black font-bold text-2xl">K</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold bg-neon-gradient bg-clip-text text-transparent">
                      Welcome to khudka.ai
                    </h2>
                    <p className="text-muted-foreground max-w-md text-sm sm:text-base">
                      Talk with AI like never before – for free! Start a conversation by typing a message below.
                    </p>
                    {!apiKey && (
                      <Button
                        onClick={() => setIsApiKeyModalOpen(true)}
                        className="bg-neon-gradient hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] transition-all duration-300 text-sm sm:text-base"
                      >
                        Add API Key to Get Started
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Chat Actions */}
                  <div className="flex flex-wrap justify-end gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerateResponse}
                      className="border-white/20 hover:border-white/30 text-xs sm:text-sm"
                    >
                      <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Regenerate</span>
                    </Button>
                    <ExportModal 
                      messages={messages} 
                      chatTitle={chatHistory.find(chat => chat.id === currentChatId)?.title || "Chat Export"}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearChat}
                      className="border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                  </div>

                  {/* Messages */}
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <MessageBubble 
                      message={{
                        id: 'typing',
                        content: '',
                        isUser: false,
                        timestamp: new Date()
                      }}
                      isTyping={true}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Input */}
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isTyping}
          />
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveApiKey={handleSaveApiKey}
        currentApiKey={apiKey}
      />
    </div>
  );
};

export default Index;
