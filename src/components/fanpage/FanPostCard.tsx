
'use client';

import { FanPost } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface FanPostCardProps {
  post: FanPost;
}

export function FanPostCard({ post }: FanPostCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <div className="flex items-center gap-2 pt-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.authorImage || undefined} />
            <AvatarFallback>{post.authorName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{post.authorName}</p>
            <p className="text-xs text-muted-foreground">
              {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: es }) : 'justo ahora'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base whitespace-pre-wrap">{post.content}</p>
      </CardContent>
    </Card>
  );
}
