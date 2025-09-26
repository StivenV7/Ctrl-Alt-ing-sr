
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type DeleteAccountDialogProps = {
  onDeleteAccount: (password?: string) => Promise<void>;
  isGoogleProvider: boolean;
};

export function DeleteAccountDialog({ onDeleteAccount, isGoogleProvider }: DeleteAccountDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isConfirmationMatching = confirmationText === 'ELIMINAR';

  const handleDelete = async () => {
    if (!isConfirmationMatching) return;
    if (!isGoogleProvider && !password) {
        toast({
            variant: 'destructive',
            title: 'Contraseña requerida',
            description: 'Debes ingresar tu contraseña para eliminar la cuenta.',
        });
        return;
    }

    setLoading(true);
    try {
      await onDeleteAccount(password);
      setIsOpen(false);
      toast({
        title: 'Cuenta eliminada',
        description: 'Tu cuenta ha sido eliminada permanentemente.',
      });
      // The user will be redirected by the auth listener
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al eliminar la cuenta',
        description: error.message || 'Ocurrió un error. Verifica tu contraseña.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Eliminar Cuenta</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos tus datos de nuestros servidores.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
            <div className='space-y-2'>
                <Label htmlFor="confirmation">Para confirmar, escribe <strong>ELIMINAR</strong> en el campo de abajo.</Label>
                <Input
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="ELIMINAR"
                    autoComplete='off'
                />
            </div>
            {!isGoogleProvider && (
                 <div className='space-y-2'>
                    <Label htmlFor="password">Ingresa tu contraseña para confirmar.</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
            )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationMatching || loading || (!isGoogleProvider && !password)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar permanentemente
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
