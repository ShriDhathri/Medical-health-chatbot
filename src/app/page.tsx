"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Message, Mood, MoodEntry, Conversation } from '@/lib/types';
import { generateResponse } from '@/ai/flows/generate-response';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Smile, Heart, Meh, Frown, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

const moodOptions: { mood: Mood; icon: React.ElementType }[] = [
  { mood: 'Happy', icon: Smile },
  { mood: 'Calm', icon: Heart },
  { mood: 'Neutral', icon: Meh },
  { mood: 'Sad', icon: Frown },
  { mood: 'Anxious', icon: Zap },
];

function ChatMessage({ message }: { message: Message }) {
  const isBot = message.role === 'bot';
  return (
    <div className={cn('flex items-start gap-3', isBot ? '' : 'justify-end')}>
      {isBot && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-transparent"><Bot /></AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-sm md:max-w-md rounded-xl p-3 px-4 text-sm shadow-sm',
          isBot
            ? 'bg-card text-card-foreground'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.text === '...' ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
      {!isBot && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-transparent"><User /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations', []);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useLocalStorage<MoodEntry[]>('moodHistory', []);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start a new conversation or load an existing one
    if (conversations.length > 0) {
      const lastConv = conversations[conversations.length-1];
      // Check if last conversation is recent (e.g., within last 2 hours)
      const lastMessageDate = lastConv.messages.length > 0 ? new Date(lastConv.messages[lastConv.messages.length - 1].timestamp) : new Date(lastConv.date);
      if (Date.now() - lastMessageDate.getTime() < 2 * 60 * 60 * 1000) {
        setCurrentConversationId(lastConv.id);
        setMessages(lastConv.messages);
      } else {
        startNewConversation();
      }
    } else {
      startNewConversation();
    }
  }, []);

  useEffect(() => {
    // Save messages to conversations when they change
    if (currentConversationId) {
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversationId ? { ...conv, messages } : conv
      );
      if (!conversations.find(c => c.id === currentConversationId)) {
        updatedConversations.push({ id: currentConversationId, date: new Date().toISOString(), messages });
      }
      // Debounce or use a save button if performance is an issue
      setConversations(updatedConversations);
    }
  }, [messages, currentConversationId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const startNewConversation = () => {
    const newId = uuidv4();
    setCurrentConversationId(newId);
    const initialMessages: Message[] = [
      { id: uuidv4(), role: 'bot', text: "Hello! I'm Wellbeing Chat. How are you feeling today? You can share anything that's on your mind.", timestamp: new Date().toISOString() },
    ];
    setMessages(initialMessages);
    const newConversation: Conversation = { id: newId, date: new Date().toISOString(), messages: initialMessages };
    setConversations([...conversations, newConversation]);
  };

  const handleMoodSelect = (mood: Mood) => {
    const newMoodEntry: MoodEntry = { id: uuidv4(), mood, timestamp: new Date().toISOString() };
    setMoodHistory([...moodHistory, newMoodEntry]);
    toast({
      title: 'Mood Recorded',
      description: `You're feeling ${mood}.`,
    });
    setMessages(prev => [...prev, { id: uuidv4(), role: 'bot', text: `Thanks for sharing that you're feeling ${mood.toLowerCase()}. What's on your mind?`, timestamp: new Date().toISOString() }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: uuidv4(), role: 'user', text: input, timestamp: new Date().toISOString() };
    const thinkingMessage: Message = { id: uuidv4(), role: 'bot', text: '...', timestamp: new Date().toISOString() };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => `${msg.role}: ${msg.text}`).join('\n');
      const response = await generateResponse({ userInput: input, conversationHistory });
      
      const botMessage: Message = { id: uuidv4(), role: 'bot', text: response.chatbotResponse, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev.slice(0, -1), botMessage]);

    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = { id: uuidv4(), role: 'bot', text: 'Sorry, I encountered an error. Please try again.', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get a response from the chatbot.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">How are you feeling today?</h2>
            <div className="flex justify-center sm:justify-start gap-2 mt-2">
              {moodOptions.map(({ mood, icon: Icon }) => (
                <Button key={mood} variant="outline" size="icon" className="rounded-full w-12 h-12" onClick={() => handleMoodSelect(mood)} aria-label={`Select mood: ${mood}`}>
                  <Icon className="w-6 h-6" />
                </Button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label="Send message">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
