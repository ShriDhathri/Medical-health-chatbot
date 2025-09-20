"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Pill, Clock, Upload, File as FileIcon, Trash2, Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Prescription } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useLocalStorage('user', null);
  const [prescriptions, setPrescriptions] = useLocalStorage<Prescription[]>('prescriptions', []);
  const [authChecked, setAuthChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (!storedUser || storedUser === 'null') {
        router.push('/login');
      } else {
        setUser(JSON.parse(storedUser));
        setAuthChecked(true);
      }
    }
  }, [router, setUser]);
  
  useEffect(() => {
    // Request notification permission on component mount
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { id: uuidv4(), name: '', dosage: '', time: '' }]);
  };

  const handlePrescriptionChange = (id: string, field: keyof Omit<Prescription, 'id' | 'file' | 'reminderId'>, value: string) => {
    const updatedPrescriptions = prescriptions.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setPrescriptions(updatedPrescriptions);
  };
  
  const handleFileChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB.',
        });
        return;
      }
      const updatedPrescriptions = prescriptions.map(p =>
        p.id === id ? { ...p, file: { name: file.name, type: file.type, size: file.size } } : p
      );
      setPrescriptions(updatedPrescriptions);
      toast({
        title: 'File Uploaded',
        description: `${file.name} has been attached.`,
      });
    }
  };

  const handleRemovePrescription = (id: string) => {
    const prescriptionToRemove = prescriptions.find(p => p.id === id);
    if(prescriptionToRemove?.reminderId) {
        clearTimeout(prescriptionToRemove.reminderId);
    }
    setPrescriptions(prescriptions.filter(p => p.id !== id));
    toast({
        variant: "destructive",
        title: 'Prescription Removed',
    });
  };

  const setReminder = (prescription: Prescription) => {
    if (!prescription.time) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please set a time for the reminder.'});
        return;
    }

    if ('Notification' in window && Notification.permission === 'granted') {
        const [hours, minutes] = prescription.time.split(':').map(Number);
        const now = new Date();
        const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

        if (reminderTime < now) {
            reminderTime.setDate(reminderTime.getDate() + 1); // Set for tomorrow if time has passed today
        }
        
        const delay = reminderTime.getTime() - now.getTime();
        
        const reminderId = window.setTimeout(() => {
            new Notification('Medication Reminder', {
                body: `It's time to take your ${prescription.name} (${prescription.dosage}).`,
                icon: '/logo.png' 
            });
        }, delay);

        const updatedPrescriptions = prescriptions.map(p => p.id === prescription.id ? {...p, reminderId: reminderId as unknown as number} : p);
        setPrescriptions(updatedPrescriptions);

        toast({
            title: 'Reminder Set!',
            description: `You'll be notified at ${prescription.time} to take ${prescription.name}.`
        });
    } else if ('Notification' in window && Notification.permission === 'denied') {
        toast({
            variant: 'destructive',
            title: 'Notification Permission Denied',
            description: 'Please enable notifications in your browser settings to use this feature.',
        });
    } else {
         toast({
            variant: 'destructive',
            title: 'Enable Notifications',
            description: 'Please allow notifications to set reminders.',
        });
    }
  };

  const cancelReminder = (id: string) => {
    const prescription = prescriptions.find(p => p.id === id);
    if (prescription?.reminderId) {
      clearTimeout(prescription.reminderId);
      const updatedPrescriptions = prescriptions.map(p => p.id === id ? { ...p, reminderId: undefined } : p);
      setPrescriptions(updatedPrescriptions);
      toast({
        title: 'Reminder Canceled',
        description: `The reminder for ${prescription.name} has been turned off.`,
      });
    }
  };

  if (!authChecked || !user) {
    return <div className="flex h-full items-center justify-center"><p>Loading profile...</p></div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarFallback className="bg-transparent text-2xl">
                <User />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{user.username}</CardTitle>
              <CardDescription>Manage your profile and prescription reminders.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Reminders</CardTitle>
          <CardDescription>
            Add your prescriptions and set daily reminders. You must upload a proof of prescription to enable alarms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {prescriptions.map((p) => (
            <div key={p.id} className="rounded-lg border p-4 space-y-4 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleRemovePrescription(p.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${p.id}`}><Pill className="inline-block mr-2 h-4 w-4" />Medication Name</Label>
                  <Input id={`name-${p.id}`} value={p.name} onChange={(e) => handlePrescriptionChange(p.id, 'name', e.target.value)} placeholder="e.g., Sertraline" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`dosage-${p.id}`}>Dosage</Label>
                  <Input id={`dosage-${p.id}`} value={p.dosage} onChange={(e) => handlePrescriptionChange(p.id, 'dosage', e.target.value)} placeholder="e.g., 50mg" />
                </div>
              </div>

              {!p.file ? (
                <div className="space-y-2">
                  <Label>Upload Prescription</Label>
                  <div className="flex items-center gap-2">
                    <Input id={`file-${p.id}`} type="file" accept="image/*,.pdf" className="hidden" ref={fileInputRef} onChange={(e) => handleFileChange(p.id, e)} />
                    <Button variant="outline" onClick={() => document.getElementById(`file-${p.id}`)?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Choose File
                    </Button>
                    <span className="text-xs text-muted-foreground">PDF or Image up to 5MB</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                    <div className="text-sm flex items-center gap-2 p-2 rounded-md bg-secondary">
                        <FileIcon className="h-4 w-4 shrink-0" />
                        <span className="font-medium truncate flex-1">{p.file.name}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handlePrescriptionChange(p.id, 'file', undefined)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor={`time-${p.id}`}><Clock className="inline-block mr-2 h-4 w-4" />Reminder Time</Label>
                            <Input id={`time-${p.id}`} type="time" value={p.time} onChange={(e) => handlePrescriptionChange(p.id, 'time', e.target.value)} />
                        </div>
                        
                        {p.reminderId ? (
                             <Button variant="destructive" onClick={() => cancelReminder(p.id)}>
                                <BellOff className="mr-2 h-4 w-4" /> Cancel Reminder
                            </Button>
                        ) : (
                            <Button onClick={() => setReminder(p)}>
                                <Bell className="mr-2 h-4 w-4" /> Set Reminder
                            </Button>
                        )}
                    </div>
                     {p.reminderId && <p className="text-xs text-green-500 text-center md:text-left">Reminder is active for {p.time}.</p>}
                </div>
              )}
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={handleAddPrescription}>
            <Pill className="mr-2 h-4 w-4" /> Add another prescription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
