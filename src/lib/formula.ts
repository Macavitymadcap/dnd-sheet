// Evaluates the small formula language used by metric trackers,
// e.g. "PB + WIS" or "max(1, floor(LEVEL / 2))".

export interface FormulaVars {
  PB: number; LEVEL: number;
  STR: number; DEX: number; CON: number; INT: number; WIS: number; CHA: number;
}

export function evalFormula(expr: unknown, v: FormulaVars): number {
  try {
    const fn = new Function('PB', 'LEVEL', 'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA',
      'floor', 'ceil', 'round', 'max', 'min', 'abs',
      'return (' + String(expr || '0') + ')');
    const r = fn(v.PB, v.LEVEL, v.STR, v.DEX, v.CON, v.INT, v.WIS, v.CHA,
      Math.floor, Math.ceil, Math.round, Math.max, Math.min, Math.abs);
    return Number.isFinite(r) ? Math.max(0, Math.floor(r)) : 0;
  } catch {
    return 0;
  }
}
