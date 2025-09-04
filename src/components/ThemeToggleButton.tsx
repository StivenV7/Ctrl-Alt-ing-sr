
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

export function ThemeToggleButton() {
  // Start with a null theme to avoid hydration mismatch
  const [theme, setTheme] = useState<Theme | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On mount, read the theme from localStorage
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = storedTheme || 'light';
    setTheme(initialTheme);
  }, []);
  
  useEffect(() => {
    // When theme state changes, update localStorage and the document attribute
    if (theme) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Until the component is mounted, don't render anything to avoid mismatch
  if (!mounted || !theme) {
    return <div className="h-10 w-10" />; // Render a placeholder to maintain layout
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
