import type { LucideIcon } from 'lucide-react';

export type Message = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
};

export type Conversation = {
  id: string;
  date: string;
  messages: Message[];
};

export type Mood = 'Happy' | 'Calm' | 'Neutral' | 'Sad' | 'Anxious';

export type MoodEntry = {
  id: string;
  mood: Mood;
  timestamp: string;
};

export type Resource = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon?: LucideIcon;
};

export type EmergencyContact = {
    id: string;
    name: string;
    phone: string;
};

export type Prescription = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  file?: {
    name: string;
    type: string;
    size: number;
  };
  reminderId?: number;
};
