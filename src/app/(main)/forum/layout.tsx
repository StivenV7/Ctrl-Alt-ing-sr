
'use client';

import { ForumSidebar } from '@/components/forum/ForumSidebar';

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
        <aside className="hidden md:block">
            <ForumSidebar />
        </aside>
        <div className="w-full">
            {children}
        </div>
    </div>
  );
}
