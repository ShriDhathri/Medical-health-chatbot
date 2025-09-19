"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, User, Bot, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { EmergencyContact } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [, setUser] = useLocalStorage('user', null);
  const [emergencyContacts, setEmergencyContacts] = useLocalStorage<EmergencyContact[]>('emergencyContacts', []);

  const handleAddContact = () => {
    if (emergencyContacts.length < 2) {
      setEmergencyContacts([...emergencyContacts, { id: uuidv4(), name: '', phone: '' }]);
    } else {
        toast({
            variant: "destructive",
            title: "Limit Reached",
            description: "You can add a maximum of 2 emergency contacts.",
        });
    }
  };

  const handleContactChange = (id: string, field: 'name' | 'phone', value: string) => {
    const updatedContacts = emergencyContacts.map(contact =>
      contact.id === id ? { ...contact, [field]: value } : contact
    );
    setEmergencyContacts(updatedContacts);
  };

  const handleRemoveContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!username.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please enter both username and password.",
      });
      return;
    }

    // Simulate a successful login
    setUser({ username });
    toast({
      title: "Login Successful",
      description: `Welcome back, ${username}!`,
    });
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-8 w-8" />
                </div>
            </div>
          <CardTitle className="text-2xl font-bold">Welcome to TheraByte chat</CardTitle>
          <CardDescription>Sign in to continue to your personal space.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
                <Label>Emergency Contacts (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                    Add up to two contacts to be notified in case of a crisis.
                </p>
            </div>
            
            {emergencyContacts.map((contact, index) => (
              <div key={contact.id} className="space-y-2 rounded-md border p-4 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleRemoveContact(contact.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
                <div className="space-y-1">
                  <Label htmlFor={`contact-name-${index}`} className="text-xs">Contact Name</Label>
                  <Input
                    id={`contact-name-${index}`}
                    placeholder="e.g., Jane Doe"
                    value={contact.name}
                    onChange={e => handleContactChange(contact.id, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`contact-phone-${index}`} className="text-xs">Contact Phone</Label>
                  <Input
                    id={`contact-phone-${index}`}
                    placeholder="e.g., 555-123-4567"
                    value={contact.phone}
                    onChange={e => handleContactChange(contact.id, 'phone', e.target.value)}
                  />
                </div>
              </div>
            ))}

            {emergencyContacts.length < 2 && (
              <Button variant="outline" className="w-full" onClick={handleAddContact}>
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
