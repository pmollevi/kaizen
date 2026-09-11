import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  Dumbbell,
  Salad,
  Moon,
  Library,
  Flower2,
  Users,
  Palette,
  HeartHandshake,
} from "lucide-react";

// Un ícono lucide por hábito del catálogo, en vez de emoji: consistente entre
// plataformas y accesible (currentColor, escalable, sin depender de la fuente del sistema).
export const ICONOS_HABITO: Record<string, LucideIcon> = {
  intelecto: BookOpen,
  imperio: Briefcase,
  fuerza: Dumbbell,
  vitalidad: Salad,
  energia: Moon,
  sabiduria: Library,
  serenidad: Flower2,
  vinculos: Users,
  creatividad: Palette,
  gratitud: HeartHandshake,
};

export function iconoDeHabito(id: string): LucideIcon {
  return ICONOS_HABITO[id] ?? BookOpen;
}
