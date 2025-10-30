'use client';

import type { Rank } from '@/lib/types';
import { RANKS } from '@/lib/constants';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Display constant for XP progress visualization
const MAX_XP_FOR_DISPLAY = 1000;

type RankDisplayProps = {
  rank: Rank;
  xp: number;
  displayName: string;
};

export function RankDisplay({ rank, xp, displayName }: RankDisplayProps) {
  const { user } = useAuth();
  const currentRankIndex = RANKS.findIndex(r => r.name === rank.name);
  const nextRank = RANKS[currentRankIndex + 1];

  // Since ranks are based on completed habits, show XP as the primary progress metric
  // Progress bar shows relative position between current and max possible XP
  const progress = Math.min(Math.floor((xp / MAX_XP_FOR_DISPLAY) * 100), 100);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3 w-full md:w-48">
            {user ? (
               <Avatar>
                {user.photoURL && <AvatarImage src={user.photoURL} alt={displayName} />}
                <AvatarFallback>{displayName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <rank.icon className="h-8 w-8 text-accent" />
            )}
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground">{xp} XP</p>
              </div>
              <Progress value={progress} className="h-2" />
               <p className="text-xs text-muted-foreground mt-1">{rank.name}</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {nextRank ? (
            <p>Completa más retos para alcanzar: {nextRank.name}</p>
          ) : (
            <p>¡Has alcanzado el rango más alto!</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
