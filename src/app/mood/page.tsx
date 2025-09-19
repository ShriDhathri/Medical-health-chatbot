"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { MoodEntry, Conversation } from '@/lib/types';
import { getPersonalizedRecommendations } from '@/ai/flows/personalized-recommendations';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb } from 'lucide-react';
import { ChartTooltipContent } from '@/components/ui/chart';

const moodToValue: Record<string, number> = {
  Happy: 5,
  Calm: 4,
  Neutral: 3,
  Sad: 2,
  Anxious: 1,
};

const valueToMood: Record<number, string> = {
  5: 'Happy',
  4: 'Calm',
  3: 'Neutral',
  2: 'Sad',
  1: 'Anxious',
};


export default function MoodPage() {
  const [moodHistory] = useLocalStorage<MoodEntry[]>('moodHistory', []);
  const [conversations] = useLocalStorage<Conversation[]>('conversations', []);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData = useMemo(() => {
    if (!moodHistory || moodHistory.length === 0) return [];
    
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysInWeek.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const moodsOnDay = moodHistory.filter(entry => format(new Date(entry.timestamp), 'yyyy-MM-dd') === dayStr);
        const avgMoodValue = moodsOnDay.length > 0
            ? moodsOnDay.reduce((acc, curr) => acc + moodToValue[curr.mood], 0) / moodsOnDay.length
            : 0;
        
        return {
            date: format(day, 'EEE'),
            mood: avgMoodValue,
        };
    });
  }, [moodHistory]);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      const latestMood = moodHistory.length > 0 ? moodHistory[moodHistory.length - 1].mood : 'Neutral';
      const conversationHistory = conversations
        .flatMap(c => c.messages)
        .slice(-10) // Get last 10 messages for context
        .map(m => `${m.role}: ${m.text}`)
        .join('\n');

      const result = await getPersonalizedRecommendations({
        mood: latestMood,
        conversationHistory,
      });

      setRecommendations(result.recommendations);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch recommendations.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-2">Your Mood This Week</h1>
            <p className="text-muted-foreground mb-6">Visualizing your emotional wellbeing over the past week.</p>
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Mood Chart</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline mb-2">Your Mood This Week</h1>
            <p className="text-muted-foreground">Visualizing your emotional wellbeing over the past week.</p>
        </div>
        <Button onClick={handleGetRecommendations} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Get Recommendations
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Mood Chart</CardTitle>
          <CardDescription>
            An overview of your average mood each day this week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {moodHistory.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} tickCount={6} tickFormatter={(value) => valueToMood[value] || ''} tickLine={false} axisLine={false} />
                  <Tooltip
                     cursor={{ fill: 'hsl(var(--accent) / 0.3)' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Avg. Mood
                                            </span>
                                            <span className="font-bold text-muted-foreground">
                                                {payload[0].value > 0 ? valueToMood[Math.round(Number(payload[0].value))] : 'Not tracked'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        return null;
                    }}
                  />
                  <Bar dataKey="mood" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-center text-muted-foreground bg-secondary/50 rounded-lg">
                <Smile className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Mood Data Yet</h3>
                <p>Track your mood on the Chat page to see your history here.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personalized Recommendations</DialogTitle>
            <DialogDescription>
              Based on your recent mood and conversations, here are a few things that might help.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-3 mt-4">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
