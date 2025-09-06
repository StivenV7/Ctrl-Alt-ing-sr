
import { Shield, Star, Trophy, Award, Gem, Crown } from 'lucide-react';
import type { Rank } from './types';


export const RANKS: Rank[] = [
  { 
    name: 'Novato', 
    icon: Shield,
    description: "Completa tu primer reto para empezar.",
    requirements: { "total": 1 } 
  },
  { 
    name: 'Aprendiz', 
    icon: Star,
    description: "Completa 2 retos en 2 categorías distintas.",
    requirements: { "Salud": 1, "Crecimiento Personal": 1 } 
  },
  { 
    name: 'Adepto', 
    icon: Award,
    description: "Completa 5 retos en al menos 3 categorías.",
    requirements: { "Salud": 2, "Crecimiento Personal": 2, "Bienestar": 1 } 
  },
  { 
    name: 'Maestro', 
    icon: Trophy,
    description: "Alcanza la maestría con 10 retos completados.",
    requirements: { "Salud": 4, "Crecimiento Personal": 3, "Bienestar": 3 } 
  },
  { 
    name: 'Gran Maestro', 
    icon: Gem,
    description: "Un verdadero experto en hábitos.",
    requirements: { "Salud": 7, "Crecimiento Personal": 7, "Bienestar": 6 } 
  },
  {
    name: 'Leyenda',
    icon: Crown,
    description: "Has trascendido la disciplina.",
    requirements: { "Salud": 10, "Crecimiento Personal": 10, "Bienestar": 10 }
  }
];

