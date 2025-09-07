
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { useThemeObserver } from '@/hooks/useThemeObserver';

// Since the layout itself cannot be a client component for metadata reasons,
// we create a small client component to house the hook.
function ThemeObserver() {
  useThemeObserver();
  return null; // This component doesn't render anything.
}

// We cannot export metadata from a client component.
// But we can keep it here as the layout is still a server component.
/*
export const metadata: Metadata = {
  title: 'Habitica',
  description: 'Gamified habit tracker to motivate users.',
};
*/


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>Habitica</title>
        <meta name="description" content="Gamified habit tracker to motivate users." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ThemeObserver />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
