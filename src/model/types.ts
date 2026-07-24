// The character model: default shape, item factories, localStorage
// persistence, and migrations for older saved characters.

import { defaults } from "./create";

export const STORAGE_KEY = "dnd-character-sheet-v2";
export const THEME_KEY = "dnd-theme";

export interface Damage {
  dice: string | number;
  die: string;
  bonus: string;
  type: string;
}

export interface Metric {
  metric: "none" | "uses" | "dice" | "bonus";
  source: "pb" | "ability" | "level" | "fixed" | "formula";
  ability: string;
  fixed: number;
  formula: string;
  dieSize: string;
  reset: "none" | "short" | "long";
  current: number;
}

export type Character = ReturnType<typeof defaults>;
