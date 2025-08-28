import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { subDays, format, isSameDay, parseISO } from 'date-fns';
import type { HabitEntry } from './types';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateStreak(entries: HabitEntry[]): { count: number, justIncreased: boolean } {
    if (!entries || entries.length === 0) {
        return { count: 0, justIncreased: false };
    }

    let streak = 0;
    let justIncreased = false;
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Filter out future entries and sort remaining ones by date descending
    const pastOrTodayEntries = entries
        .filter(e => parseISO(e.date) <= today)
        .sort((a, b) => b.date.localeCompare(a.date));

    // Find the most recent completed entry
    const lastCompletedEntry = pastOrTodayEntries.find(e => e.completed);

    if (!lastCompletedEntry) {
        return { count: 0, justIncreased: false };
    }

    const lastCompletionDate = parseISO(lastCompletedEntry.date);

    // Check if the last completed entry is today or yesterday
    const isToday = isSameDay(lastCompletionDate, today);
    const isYesterday = isSameDay(lastCompletionDate, subDays(today, 1));
    const lastEntryIsToday = isSameDay(parseISO(pastOrTodayEntries[0].date), today);


    if (!isToday && !isYesterday) {
        // Streak is broken
        return { count: 0, justIncreased: false };
    }

    // If we are here, there is a potential streak. Let's count it.
    let currentStreak = 0;
    let expectedDate = lastCompletionDate;

    for (const entry of pastOrTodayEntries) {
        const entryDate = parseISO(entry.date);
        if (isSameDay(entryDate, expectedDate)) {
            if (entry.completed) {
                currentStreak++;
                expectedDate = subDays(expectedDate, 1);
            } else {
                // Gap in completions, streak ends
                break;
            }
        }
        // If entry date does not match expected date, it means there is a gap.
        // We allow for gaps of non-completed days if they are not the current day.
    }
    
    // Check if the streak was just updated today
    if (isToday && lastCompletedEntry.completed && pastOrTodayEntries[1] && isSameDay(parseISO(pastOrTodayEntries[1].date), subDays(today, 1)) && pastOrTodayEntries[1].completed) {
        justIncreased = true;
    } else if (isToday && lastCompletedEntry.completed && currentStreak === 1) {
        // Special case for starting a new streak today after a break
        justIncreased = false;
    }


    return { count: currentStreak, justIncreased };
}
