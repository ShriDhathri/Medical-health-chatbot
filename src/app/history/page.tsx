"use client";

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Conversation, Message } from '@/lib/types';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Bot, User, History as HistoryIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

function HistoryMessage({ message }: { message: Message }) {
  const isBot = message.role === 'bot';
  return (
    <div className={cn('flex items-start gap-3', isBot ? '' : 'justify-end')}>
      {isBot && (
        <Avatar className="h-6 w-6 border">
          <AvatarFallback className="bg-transparent text-xs"><Bot size={14} /></AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-md rounded-lg p-2 px-3 text-sm',
          isBot
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-primary/80 text-primary-foreground'
        )}
      >
        <p>{message.text}</p>
      </div>
      {!isBot && (
        <Avatar className="h-6 w-6 border">
          <AvatarFallback className="bg-transparent text-xs"><User size={14} /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [conversations] = useLocalStorage<Conversation[]>('conversations', []);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const sortedConversations = [...conversations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-2">Conversation History</h1>
      <p className="text-muted-foreground mb-8">
        Review your past conversations with the chatbot.
      </p>

      {isClient && conversations.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {sortedConversations.filter(c => c.messages.length > 1).map((conv) => (
            <AccordionItem value={conv.id} key={conv.id}>
              <AccordionTrigger>
                <div className='flex flex-col items-start'>
                    <span className="font-semibold">
                      {format(new Date(conv.date), 'MMMM d, yyyy')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {conv.messages.length} messages
                    </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-[400px] p-4 border rounded-md">
                    <div className="space-y-4">
                        {conv.messages.map((message) => (
                            <HistoryMessage key={message.id} message={message} />
                        ))}
                    </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center text-center text-muted-foreground">
          <HistoryIcon className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">No History Yet</h3>
          <p>Your past conversations will appear here once you start chatting.</p>
        </div>
      )}
    </div>
  );
}
