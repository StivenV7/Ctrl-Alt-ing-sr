
'use client';

import { useEffect } from 'react';
import { useAuth } from './use-auth';
import { Habit } from '@/lib/types';
import { isSameDay, parseISO } from 'date-fns';

// Store timeout IDs to prevent scheduling multiple notifications
const notificationTimeouts = new Map<string, NodeJS.Timeout>();

export function useNotifications() {
  const { userDoc, loading } = useAuth();

  useEffect(() => {
    // Run only on client, when auth is loaded, and user is logged in
    if (typeof window === 'undefined' || loading || !userDoc) {
      return;
    }
    
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    if (!notificationsEnabled) {
      return;
    }

    if (!('Notification' in window)) {
      console.error('Este navegador no soporta notificaciones de escritorio.');
      return;
    }

    const habits: Habit[] = userDoc.data()?.habits || [];

    const requestPermissionAndSchedule = () => {
      if (Notification.permission === 'granted') {
        scheduleDailyReminders(habits);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            localStorage.setItem('notificationsEnabled', 'true');
            scheduleDailyReminders(habits);
          } else {
             localStorage.setItem('notificationsEnabled', 'false');
          }
        });
      }
    };

    requestPermissionAndSchedule();

    // Cleanup function to clear timeouts when component unmounts or user changes
    return () => {
      notificationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      notificationTimeouts.clear();
    };

  }, [userDoc, loading]);
}

function scheduleDailyReminders(habits: Habit[]) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  habits.forEach((habit) => {
    // Check if the habit has already been completed today
    const hasCompletedToday = habit.entries.some(
      (entry) => isSameDay(parseISO(entry.date), today) && entry.completed
    );

    if (hasCompletedToday) {
      return; // Don't schedule a reminder if already completed
    }

    // Schedule a reminder for 7 PM today
    const reminderTime = new Date();
    reminderTime.setHours(19, 0, 0, 0); // 7:00 PM

    // If it's already past 7 PM, don't schedule for today
    if (now > reminderTime) {
      return;
    }

    const delay = reminderTime.getTime() - now.getTime();

    // Clear any existing timeout for this habit to avoid duplicates
    if (notificationTimeouts.has(habit.id)) {
      clearTimeout(notificationTimeouts.get(habit.id));
    }

    const timeoutId = setTimeout(() => {
      new Notification('¡No te olvides de tu hábito!', {
        body: `Aún no has completado tu reto de hoy: "${habit.name}". ¡Tú puedes!`,
        icon: '/logo.png', // You should add a logo.png to your public folder
        tag: `habit-reminder-${habit.id}`, // Tag to prevent multiple notifications for the same habit
      });
      notificationTimeouts.delete(habit.id); // Clean up after showing
    }, delay);

    notificationTimeouts.set(habit.id, timeoutId);
  });
}
