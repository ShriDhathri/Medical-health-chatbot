"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Bot, MessageCircle, Smile, History, BookOpen, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';

function AppHeader() {
    const { isMobile, open, setOpen } = useSidebar();
    
    return(
        <header className="flex items-center justify-between p-4 border-b h-16">
            <div className='flex items-center gap-4'>
                <SidebarTrigger className={cn(isMobile ? "" : "hidden")}/>
                <h1 className="text-xl font-headline font-bold">Wellbeing Chat</h1>
            </div>
            {/* Can add user profile icon here */}
        </header>
    )
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user] = useLocalStorage('user', null);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const menuItems = [
    { href: '/', label: 'Chat', icon: MessageCircle },
    { href: '/mood', label: 'Mood', icon: Smile },
    { href: '/history', label: 'History', icon: History },
    { href: '/resources', label: 'Resources', icon: BookOpen },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" side="left" variant="sidebar">
        <SidebarHeader className="h-16">
            <div className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Bot className="h-6 w-6" />
                </div>
                <h1 className="text-xl font-headline font-bold group-data-[collapsible=icon]:opacity-0 transition-opacity duration-300 ease-in-out">
                    Wellbeing Chat
                </h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={{children: item.label, side: "right"}}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             {!user && (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/login'} tooltip={{children: 'Login', side: "right"}}>
                    <Link href="/login">
                        <LogIn />
                        <span>Login</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <div className="p-4 sm:p-6 lg:p-8">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
