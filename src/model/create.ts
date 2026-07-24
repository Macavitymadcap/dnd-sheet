import { Metric, Damage, Character, STORAGE_KEY } from "./types";
import { ClassEntry } from "../rules";

export function metricDefaults(): Metric {
  return {
    metric: "none",
    source: "pb",
    ability: "wis",
    fixed: 1,
    formula: "PB",
    dieSize: "6",
    reset: "none",
    current: 0,
  };
}

export function newFeature() {
  return {
    id: crypto.randomUUID(),
    name: "",
    desc: "",
    ...metricDefaults(),
    reset: "long" as const,
  };
}

export function newEquip() {
  return {
    id: crypto.randomUUID(),
    name: "",
    desc: "",
    qty: 1,
    weight: "" as string | number,
    ...metricDefaults(),
  };
}

export function newClass(): ClassEntry {
  return {
    id: crypto.randomUUID(),
    name: "",
    level: 1,
    hitDie: "8",
    caster: "none",
    hdRemaining: 1,
  };
}

export function newInnate() {
  return {
    id: crypto.randomUUID(),
    name: "",
    origin: "",
    castAbility: "cha",
    level: "",
    notes: "",
    ...metricDefaults(),
    metric: "uses" as const,
    source: "fixed" as const,
    fixed: 1,
    reset: "long" as const,
    current: 1,
  };
}

export function newDamage(): Damage {
  return { dice: "", die: "6", bonus: "", type: "" };
}

export function newAttack() {
  return {
    name: "",
    ability: "",
    prof: false,
    misc: "" as string | number,
    damage: newDamage(),
  };
}

export function newSpell() {
  return {
    id: crypto.randomUUID(),
    name: "",
    school: "",
    prepared: false,
    concentration: false,
    ritual: false,
    castingTime: "",
    range: "",
    components: "",
    duration: "",
    damage: newDamage(),
    desc: "",
  };
}

export function emptySpellLevels() {
  const a: {
    slotsTotal: string | number;
    slotsUsed: number;
    spells: ReturnType<typeof newSpell>[];
  }[] = [];
  for (let i = 0; i <= 9; i++) {
    a.push({ slotsTotal: "", slotsUsed: 0, spells: [] });
  }
  return a;
}

export function newDamageText(damageText: Partial<Damage> | null | undefined): string {
  if (!damageText || typeof damageText !== "object") return "—";
  const cnt = Number(damageText.dice) || 0;
  let s = cnt > 0 ? cnt + "d" + (damageText.die || "6") : "";
  const b = String(damageText.bonus || "").trim();
  if (b) s += /^[+-]/.test(b) ? b : "+" + b;
  const t = String(damageText.type || "").trim();
  if (t) s += (s ? " " : "") + t;
  return s || "—";
}

export function defaults() {
  return {
    name: "",
    clazz: "",
    level: 1,
    classes: [] as ClassEntry[],
    background: "",
    player: "",
    race: "",
    alignment: "",
    xp: 0 as string | number,
    abilities: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    } as Record<string, string | number>,
    saveProfs: {} as Record<string, boolean>,
    skillProfs: {} as Record<string, number | string>,
    inspiration: false,
    ac: "",
    speeds: { walk: "", fly: "", swim: "", climb: "", burrow: "" } as Record<
      string,
      string
    >,
    speedShow: {
      fly: false,
      swim: false,
      climb: false,
      burrow: false,
    } as Record<string, boolean>,
    initBonus: "",
    initOverride: "",
    hpMax: "" as string | number,
    hpCurrent: "" as string | number,
    hpTemp: "" as string | number,
    deathSucc: 0,
    deathFail: 0,
    attacks: [newAttack()],
    otherProfs: "",
    profList: [] as string[],
    coins: { cp: "", sp: "", ep: "", gp: "", pp: "" },
    features: [] as ReturnType<typeof newFeature>[],
    equipment: [] as ReturnType<typeof newEquip>[],
    personality: "",
    ideals: "",
    bonds: "",
    flaws: "",
    age: "",
    height: "",
    weight: "",
    eyes: "",
    skin: "",
    hair: "",
    appearance: "",
    backstory: "",
    allies: "",
    treasure: "",
    factionName: "",
    spellAbility: "int",
    preparedMax: "",
    autoSlots: true,
    pactUsed: 0,
    innate: [] as ReturnType<typeof newInnate>[],
    spellLevels: emptySpellLevels(),
    conditions: {} as Record<string, boolean>,
    exhaustion: 0,
    senses: [] as string[],
    resistances: [] as string[],
    immunities: [] as string[],
    attuned: ["", "", ""] as string[],
  };
}

export function save(character: Character): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
  } catch (e) { 
    console.error("Error saving character to localStorage:", e);
   }
}

