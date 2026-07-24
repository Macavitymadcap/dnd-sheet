// 5e rules data: static tables the sheet derives values from.

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export const ABILITIES: [AbilityKey, string][] = [
  ['str', 'Strength'], ['dex', 'Dexterity'], ['con', 'Constitution'],
  ['int', 'Intelligence'], ['wis', 'Wisdom'], ['cha', 'Charisma'],
];

export const SKILLS: [string, string, AbilityKey][] = [
  ['acrobatics', 'Acrobatics', 'dex'], ['animalHandling', 'Animal Handling', 'wis'], ['arcana', 'Arcana', 'int'],
  ['athletics', 'Athletics', 'str'], ['deception', 'Deception', 'cha'], ['history', 'History', 'int'],
  ['insight', 'Insight', 'wis'], ['intimidation', 'Intimidation', 'cha'], ['investigation', 'Investigation', 'int'],
  ['medicine', 'Medicine', 'wis'], ['nature', 'Nature', 'int'], ['perception', 'Perception', 'wis'],
  ['performance', 'Performance', 'cha'], ['persuasion', 'Persuasion', 'cha'], ['religion', 'Religion', 'int'],
  ['sleightOfHand', 'Sleight of Hand', 'dex'], ['stealth', 'Stealth', 'dex'], ['survival', 'Survival', 'wis'],
];

export const XP = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

export function levelFromXP(xp: unknown): number {
  const n = Number(xp) || 0;
  let l = 1;
  for (let i = 0; i < XP.length; i++) { if (n >= XP[i]) l = i + 1; }
  return l;
}

export const SPEED_TYPES: [string, string][] = [['fly', 'Fly'], ['swim', 'Swim'], ['climb', 'Climb'], ['burrow', 'Burrow']];

export const CONDITIONS = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];

export const EXHAUST_EFFECTS = ['No effect', '1: Disadvantage on ability checks', '2: Speed halved', '3: Disadvantage on attack rolls & saving throws', '4: Hit point maximum halved', '5: Speed reduced to 0', '6: Death'];

export const BACKGROUND_FIELDS: [string, string][] = [['personality', 'Personality Traits'], ['ideals', 'Ideals'], ['bonds', 'Bonds'], ['flaws', 'Flaws']];

export type CasterKind = 'none' | 'full' | 'half' | 'third' | 'artificer' | 'pact';

export const CLASS_INFO: Record<string, { hitDie: string; caster: CasterKind }> = {
  Artificer: { hitDie: '8', caster: 'artificer' }, Barbarian: { hitDie: '12', caster: 'none' },
  Bard: { hitDie: '8', caster: 'full' }, Cleric: { hitDie: '8', caster: 'full' },
  Druid: { hitDie: '8', caster: 'full' }, Fighter: { hitDie: '10', caster: 'none' },
  Monk: { hitDie: '8', caster: 'none' }, Paladin: { hitDie: '10', caster: 'half' },
  Ranger: { hitDie: '10', caster: 'half' }, Rogue: { hitDie: '8', caster: 'none' },
  Sorcerer: { hitDie: '6', caster: 'full' }, Warlock: { hitDie: '8', caster: 'pact' },
  Wizard: { hitDie: '6', caster: 'full' },
};

// Multiclass spell slot table: MC_SLOTS[casterLevel] = slots for spell levels 1–9.
export const MULTICLASS_SLOTS: (number[] | null)[] = [null,
  [2, 0, 0, 0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0, 0, 0, 0], [4, 2, 0, 0, 0, 0, 0, 0, 0], [4, 3, 0, 0, 0, 0, 0, 0, 0], [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0], [4, 3, 3, 1, 0, 0, 0, 0, 0], [4, 3, 3, 2, 0, 0, 0, 0, 0], [4, 3, 3, 3, 1, 0, 0, 0, 0], [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0], [4, 3, 3, 3, 2, 1, 0, 0, 0], [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]];

// Warlock Pact Magic: PACT[warlockLevel] = { lvl: slot level, n: slot count }.
export const PACT: ({ lvl: number; n: number } | null)[] = [null,
  { lvl: 1, n: 1 }, { lvl: 1, n: 2 }, { lvl: 2, n: 2 }, { lvl: 2, n: 2 }, { lvl: 3, n: 2 },
  { lvl: 3, n: 2 }, { lvl: 4, n: 2 }, { lvl: 4, n: 2 }, { lvl: 5, n: 2 }, { lvl: 5, n: 2 },
  { lvl: 5, n: 3 }, { lvl: 5, n: 3 }, { lvl: 5, n: 3 }, { lvl: 5, n: 3 }, { lvl: 5, n: 3 },
  { lvl: 5, n: 3 }, { lvl: 5, n: 4 }, { lvl: 5, n: 4 }, { lvl: 5, n: 4 }, { lvl: 5, n: 4 }];

export interface ClassEntry { id: string; name: string; level: number | string; hitDie: string; caster: CasterKind; hdRemaining: number | string; }

export function casterLevel(classes: ClassEntry[] | undefined): number {
  let n = 0;
  (classes || []).forEach(x => {
    const l = Number(x.level) || 0;
    if (x.caster === 'full') n += l;
    else if (x.caster === 'half') n += Math.floor(l / 2);
    else if (x.caster === 'third') n += Math.floor(l / 3);
    else if (x.caster === 'artificer') n += Math.ceil(l / 2);
  });
  return n;
}

export function warlockLevel(classes: ClassEntry[] | undefined): number {
  return (classes || []).filter(x => x.caster === 'pact').reduce((n, x) => n + (Number(x.level) || 0), 0);
}
