'use client';

import type { Rank } from '@/lib/types';
import { RANKS } from '@/lib/constants';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type RankDisplayProps = {
  rank: Rank;
  xp: number;
};

export function RankDisplay({ rank, xp }: RankDisplayProps) {
  const currentRankIndex = RANKS.findIndex(r => r.name === rank.name);
  const nextRank = RANKS[currentRankIndex + 1];

  const progress = nextRank
    ? Math.floor(((xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100)
    : 100;

  const xpForNextRank = nextRank ? nextRank.minXp - xp : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3 w-48">
            <rank.icon className="h-8 w-8 text-accent" />
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-semibold">{rank.name}</p>
                <p className="text-xs text-muted-foreground">{xp} XP</p>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {nextRank ? (
            <p>{xpForNextRank} XP para el siguiente rango: {nextRank.name}</p>
          ) : (
            <p>¡Has alcanzado el rango más alto!</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
