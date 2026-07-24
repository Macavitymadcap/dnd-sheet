// The character model: default shape, item factories, localStorage
// persistence, and migrations for older saved characters.

import { CLASS_INFO, levelFromXP, type ClassEntry } from './rules';

export const STORAGE_KEY = 'dnd-character-sheet-v2';
export const THEME_KEY = 'dnd-theme';

function uid(): string {
  return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export interface Damage { dice: string | number; die: string; bonus: string; type: string; }

export interface Metric {
  metric: 'none' | 'uses' | 'dice' | 'bonus';
  source: 'pb' | 'ability' | 'level' | 'fixed' | 'formula';
  ability: string; fixed: number; formula: string; dieSize: string;
  reset: 'none' | 'short' | 'long'; current: number;
}

export type Character = ReturnType<typeof defaults>;

export function metricDefaults(): Metric {
  return { metric: 'none', source: 'pb', ability: 'wis', fixed: 1, formula: 'PB', dieSize: '6', reset: 'none', current: 0 };
}

export function newFeature() { return Object.assign({ id: uid(), name: '', desc: '' }, metricDefaults(), { reset: 'long' as const }); }
export function newEquip() { return Object.assign({ id: uid(), name: '', desc: '', qty: 1, weight: '' as string | number }, metricDefaults()); }
export function newClass(): ClassEntry { return { id: uid(), name: '', level: 1, hitDie: '8', caster: 'none', hdRemaining: 1 }; }
export function newInnate() {
  return Object.assign({ id: uid(), name: '', origin: '', castAbility: 'cha', level: '', notes: '' }, metricDefaults(),
    { metric: 'uses' as const, source: 'fixed' as const, fixed: 1, reset: 'long' as const, current: 1 });
}
export function newDamage(): Damage { return { dice: '', die: '6', bonus: '', type: '' }; }
export function newAttack() { return { name: '', ability: '', prof: false, misc: '' as string | number, damage: newDamage() }; }
export function newSpell() {
  return {
    id: uid(), name: '', school: '', prepared: false, concentration: false, ritual: false,
    castingTime: '', range: '', components: '', duration: '', damage: newDamage(), desc: '',
  };
}

export function emptySpellLevels() {
  const a: { slotsTotal: string | number; slotsUsed: number; spells: ReturnType<typeof newSpell>[] }[] = [];
  for (let i = 0; i <= 9; i++) a.push({ slotsTotal: '', slotsUsed: 0, spells: [] });
  return a;
}

export function dmgText(d: Partial<Damage> | null | undefined): string {
  if (!d || typeof d !== 'object') return '—';
  const cnt = Number(d.dice) || 0;
  let s = cnt > 0 ? cnt + 'd' + (d.die || '6') : '';
  const b = String(d.bonus || '').trim();
  if (b) s += (/^[+-]/.test(b) ? b : '+' + b);
  const t = String(d.type || '').trim();
  if (t) s += (s ? ' ' : '') + t;
  return s || '—';
}

export function defaults() {
  return {
    name: '', clazz: '', level: 1, classes: [] as ClassEntry[], background: '', player: '', race: '', alignment: '', xp: 0 as string | number,
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } as Record<string, string | number>,
    saveProfs: {} as Record<string, boolean>, skillProfs: {} as Record<string, number | string>, inspiration: false,
    ac: '', speeds: { walk: '', fly: '', swim: '', climb: '', burrow: '' } as Record<string, string>,
    speedShow: { fly: false, swim: false, climb: false, burrow: false } as Record<string, boolean>,
    initBonus: '', initOverride: '', hpMax: '' as string | number, hpCurrent: '' as string | number, hpTemp: '' as string | number,
    deathSucc: 0, deathFail: 0,
    attacks: [newAttack()],
    otherProfs: '', profList: [] as string[], coins: { cp: '', sp: '', ep: '', gp: '', pp: '' },
    features: [] as ReturnType<typeof newFeature>[], equipment: [] as ReturnType<typeof newEquip>[],
    personality: '', ideals: '', bonds: '', flaws: '',
    age: '', height: '', weight: '', eyes: '', skin: '', hair: '', appearance: '', backstory: '', allies: '', treasure: '', factionName: '',
    spellAbility: 'int', preparedMax: '', autoSlots: true, pactUsed: 0,
    innate: [] as ReturnType<typeof newInnate>[], spellLevels: emptySpellLevels(),
    conditions: {} as Record<string, boolean>, exhaustion: 0,
    senses: [] as string[], resistances: [] as string[], immunities: [] as string[],
    attuned: ['', '', ''] as string[],
  };
}

export function save(c: Character): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch { /* storage full or blocked */ }
}

/** Reads the saved character and migrates older shapes forward. */
export function load(): Character {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const c: any = Object.assign(defaults(), JSON.parse(raw));

    Object.keys(c.skillProfs || {}).forEach(k => {
      c.skillProfs[k] = c.skillProfs[k] === true ? 1 : (Number(c.skillProfs[k]) || 0);
    });
    c.profList = Array.isArray(c.profList) ? c.profList
      : (typeof c.otherProfs === 'string' && c.otherProfs.trim() ? c.otherProfs.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
    c.features = (c.features || []).map((f: any) =>
      Object.assign(newFeature(), { id: f.id || uid() }, f, f.metric ? {} : { metric: f.tracked ? 'uses' : 'none' }));
    if (typeof c.equipment === 'string') {
      const s = c.equipment.trim();
      c.equipment = s ? [Object.assign(newEquip(), { name: 'Notes', desc: s })] : [];
    }
    c.equipment = (c.equipment || []).map((e: any) => Object.assign(newEquip(), { id: e.id || uid() }, e));
    c.attacks = (c.attacks || []).map((a: any) => {
      const na: any = Object.assign(newAttack(), a);
      if (a.atk !== undefined && a.misc === undefined) na.misc = a.atk;
      na.damage = (typeof a.damage === 'string')
        ? Object.assign(newDamage(), { type: a.damage })
        : Object.assign(newDamage(), a.damage || {});
      return na;
    });
    if (!c.attacks.length) c.attacks = [newAttack()];
    if (!Array.isArray(c.spellLevels) || c.spellLevels.length !== 10) c.spellLevels = emptySpellLevels();
    c.spellLevels = c.spellLevels.map((s: any) => ({
      slotsTotal: s.slotsTotal || '', slotsUsed: s.slotsUsed || 0,
      spells: (s.spells || []).map((sp: any) => {
        const ns: any = Object.assign(newSpell(), sp);
        ns.damage = Object.assign(newDamage(), (sp && sp.damage) || {});
        return ns;
      }),
    }));
    c.speeds = Object.assign({ walk: '', fly: '', swim: '', climb: '', burrow: '' }, c.speeds || {});
    if (!c.speeds.walk && typeof c.speed === 'string') c.speeds.walk = c.speed;
    c.speedShow = Object.assign({ fly: false, swim: false, climb: false, burrow: false }, c.speedShow || {});
    if (!Array.isArray(c.classes) || !c.classes.length) {
      const nm = String(c.clazz || '').replace(/\s*\d+\s*$/, '').trim();
      const info = CLASS_INFO[nm] || { hitDie: (String(c.hitDieType || '').match(/\d+/) ? c.hitDieType : '8'), caster: 'none' };
      const lvl = levelFromXP(c.xp) || 1;
      const rem = (c.hitDiceRemaining !== '' && c.hitDiceRemaining != null && !isNaN(Number(c.hitDiceRemaining)))
        ? Number(c.hitDiceRemaining) : lvl;
      c.classes = nm ? [Object.assign(newClass(), { name: nm, level: lvl, hitDie: info.hitDie, caster: info.caster, hdRemaining: rem })] : [];
    }
    c.classes = (c.classes || []).map((x: any) => Object.assign(newClass(), x));
    c.innate = Array.isArray(c.innate) ? c.innate.map((x: any) => {
      const o: any = Object.assign(newInnate(), x);
      if (!o.origin && x && typeof x.source === 'string' && x.source && !['pb', 'ability', 'level', 'fixed', 'formula'].includes(x.source)) {
        o.origin = x.source; o.source = 'fixed';
      }
      return o;
    }) : [];
    ['senses', 'resistances', 'immunities'].forEach(k => { if (!Array.isArray(c[k])) c[k] = []; });
    c.attuned = Array.isArray(c.attuned) ? c.attuned.slice(0, 3).map((s: any) => String(s ?? '')) : ['', '', ''];
    while (c.attuned.length < 3) c.attuned.push('');
    c.conditions = (c.conditions && typeof c.conditions === 'object') ? c.conditions : {};
    c.exhaustion = Math.max(0, Math.min(6, Number(c.exhaustion) || 0));
    c.autoSlots = c.autoSlots !== undefined ? !!c.autoSlots : true;
    c.pactUsed = Number(c.pactUsed) || 0;
    c.level = c.classes.length
      ? c.classes.reduce((n: number, x: any) => n + (Number(x.level) || 0), 0)
      : levelFromXP(c.xp);
    if (!c.level) c.level = 1;
    return c as Character;
  } catch {
    return defaults();
  }
}
