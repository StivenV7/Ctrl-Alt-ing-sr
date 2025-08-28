'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Loader2, Sparkles, Plus, Send } from 'lucide-react';
import { ChatMessage, ChatOutput } from '@/lib/types';

type AIChatPanelProps = {
  chatHistory: ChatMessage[];
  onSubmit: (message: string) => Promise<ChatOutput>;
  onAddHabit: (name: string, category: string, description: string, duration: number) => void;
};

export function AIChatPanel({
  chatHistory,
  onSubmit,
  onAddHabit,
}: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    const messageToSend = input;
    setInput('');
    
    await onSubmit(messageToSend);
    setLoading(false);
  };
  
  const initialMessage = !chatHistory || chatHistory.length === 0;

  return (
    <Card className="shadow-lg sticky top-20 flex flex-col h-[calc(100vh-6rem)] max-h-[800px]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline">Coach de Hábitos IA</CardTitle>
        </div>
        <CardDescription>Chatea con la IA para crear tu plan de hábitos.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
           <div className="space-y-4">
            {initialMessage && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    <p>Soy tu coach personal de IA. ¿Qué metas tienes en mente?</p>
                    <p className="text-xs mt-2">Por ejemplo: "Quiero leer más" o "Necesito ayuda para ser más activo".</p>
                </div>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                     <div className="mt-3 space-y-2 border-t pt-2">
                        <h5 className="text-xs font-semibold">Sugerencias de Retos:</h5>
                        {msg.suggestions.map((habit, sIndex) => (
                            <div key={sIndex} className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50">
                                <div className='flex items-start gap-2'>
                                    <Lightbulb className="h-4 w-4 mt-0.5 shrink-0"/>
                                    <div>
                                        <p className="font-semibold">{habit.name}</p>
                                        <p className="text-xs text-muted-foreground">{habit.category} - {habit.duration} días</p>
                                        <p className="text-xs mt-1">{habit.description}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => onAddHabit(habit.name, habit.category, habit.description, habit.duration)}>
                                    <Plus className="h-3 w-3 mr-1"/>
                                    Añadir
                                </Button>
                            </div>
                        ))}
                     </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-muted flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        <span>Pensando...</span>
                    </div>
                </div>
            )}
           </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleFormSubmit} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder="Escribe tu meta o pregunta..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
