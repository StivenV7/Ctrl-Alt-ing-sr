
'use client';

import { useState, useEffect } from 'react';
import { getLeaderboardUsers } from '@/lib/firestore-service';
import { PublicProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Loader2, Shield, Star, Trophy, Award, Gem } from 'lucide-react';
import { RANKS } from '@/lib/constants';

function getRankIcon(rankName: string) {
    const rank = RANKS.find(r => r.name === rankName);
    return rank ? rank.icon : Shield;
}


export default function LeaderboardPage() {
  const [users, setUsers] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const leaderboardUsers = await getLeaderboardUsers();
        setUsers(leaderboardUsers);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Ranking de la Comunidad</h1>
        <p className="mt-2 text-lg text-muted-foreground">Mira quién está en la cima completando la mayor cantidad de retos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Participantes</CardTitle>
          <CardDescription>Clasificados por rango y número de retos completados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length > 0 ? users.map((user, index) => {
              const RankIcon = getRankIcon(user.rankName);
              return (
                <div key={user.uid} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold w-8 text-center ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                        {index < 3 ? <Crown className="h-6 w-6 mx-auto fill-yellow-400 text-yellow-500"/> : index + 1}
                    </span>
                    <Avatar>
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName} />
                      <AvatarFallback>{user.displayName?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <RankIcon className="h-4 w-4" /> {user.rankName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-lg text-primary">{user.completedHabits}</p>
                     <p className="text-xs text-muted-foreground">Retos Completados</p>
                  </div>
                </div>
              );
            }) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>El ranking está vacío.</p>
                    <p>¡Sé el primero en aparecer activando tu perfil público en la configuración!</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
