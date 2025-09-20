"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const dailyTasks = [
  { day: 'Sunday', task: 'Light Exercise', description: 'Engage in some light physical activity like stretching or a gentle yoga flow.' },
  { day: 'Monday', task: 'Meditation', description: 'Practice mindfulness or guided meditation to center your thoughts.' },
  { day: 'Tuesday', task: 'Breathing Exercise', description: 'Focus on deep, controlled breathing to calm your nervous system.' },
  { day: 'Wednesday', task: 'Brisk Walk', description: 'Go for a walk outdoors to get your body moving and enjoy some fresh air.' },
  { day: 'Thursday', task: 'Laughing Yoga', description: 'Engage in laughter exercises to boost your mood and reduce stress.' },
  { day: 'Friday', task: 'Light Exercise', description: 'Engage in some light physical activity like stretching or a gentle yoga flow.' },
  { day: 'Saturday', task: 'Meditation', description: 'Practice mindfulness or guided meditation to reflect on your week.' },
];

const TASK_DURATION = 30 * 60; // 30 minutes in seconds

export default function WellbeingPage() {
  const { toast } = useToast();
  const today = new Date();
  const todayName = format(today, 'EEEE');
  const todayDateStr = format(today, 'yyyy-MM-dd');
  const [completedTasks, setCompletedTasks] = useLocalStorage<Record<string, boolean>>('completedTasks', {});

  const [timeRemaining, setTimeRemaining] = useState(TASK_DURATION);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [activeTaskDay, setActiveTaskDay] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerActive) {
      setIsTimerActive(false);
      handleTaskCompletion(activeTaskDay!, true, true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeRemaining, activeTaskDay]);

  const handleTimerToggle = (day: string) => {
    if (activeTaskDay && activeTaskDay !== day) {
      toast({
        variant: "destructive",
        title: "Another task is active",
        description: "Please complete or reset the current task's timer first.",
      });
      return;
    }
    setActiveTaskDay(day);
    setIsTimerActive(prev => !prev);
  };

  const handleTimerReset = () => {
    setIsTimerActive(false);
    setTimeRemaining(TASK_DURATION);
    setActiveTaskDay(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleTaskCompletion = useCallback((day: string, isCompleted: boolean, fromTimer = false) => {
    const taskKey = `${todayDateStr}-${day}`;
    setCompletedTasks(prev => ({ ...prev, [taskKey]: isCompleted }));
    if (isCompleted) {
        if(fromTimer) {
            toast({
                title: "Task Complete!",
                description: `Great job on completing your wellbeing task for the day!`,
            });
        }
    }
  }, [todayDateStr, setCompletedTasks, toast]);

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-2">Daily Wellbeing Tasks</h1>
      <p className="text-muted-foreground mb-8">
        Take 30 minutes each day to focus on your mental and physical wellness. Today is {todayName}.
      </p>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {dailyTasks.map(({ day, task, description }) => {
          const isToday = day === todayName;
          const taskKey = `${todayDateStr}-${day}`;
          const isCompleted = completedTasks[taskKey] || false;
          const isTimerForThisTask = activeTaskDay === day;

          return (
            <Card key={day} className={`flex flex-col ${isToday ? 'border-primary shadow-lg' : 'opacity-70'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{task}</CardTitle>
                        <CardDescription>{day}'s Focus</CardDescription>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox 
                            id={`task-${day}`} 
                            checked={isCompleted}
                            onCheckedChange={(checked) => handleTaskCompletion(day, !!checked)}
                            disabled={!isToday}
                        />
                        <label htmlFor={`task-${day}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Done
                        </label>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div className="w-full space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Timer className="w-4 h-4" />
                            <span>{isTimerForThisTask ? formatTime(timeRemaining) : formatTime(TASK_DURATION)}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={isTimerForThisTask && isTimerActive ? "outline" : "default"}
                                size="icon"
                                onClick={() => handleTimerToggle(day)}
                                disabled={!isToday || isCompleted}
                                aria-label={isTimerActive ? "Pause timer" : "Start timer"}
                                className="w-9 h-9"
                            >
                                {isTimerForThisTask && isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                             <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleTimerReset}
                                disabled={!isTimerForThisTask}
                                aria-label="Reset timer"
                                className="w-9 h-9"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <Progress value={isTimerForThisTask ? ((TASK_DURATION - timeRemaining) / TASK_DURATION) * 100 : 0} />
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
