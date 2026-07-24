import { Character, STORAGE_KEY } from "./types";
import { 
  defaults, 
  newAttack, 
  newDamage, 
  newFeature, 
  newEquip, 
  emptySpellLevels, 
  newSpell, 
  newClass, 
  newInnate 
} from '../model/create';
import { CLASS_INFO, levelFromXP } from "../rules";

export function load(): Character {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();

    const character: any = Object.assign(defaults(), JSON.parse(raw));

    getProficiencies(character);
    getFeatures(character);
    getEquipment(character);
    getAttacks(character);
    getSpellLevels(character);
    getSpeeds(character);
    getClasses(character);
    getInnateSpells(character);
    getAttuned(character);
    getSenses(character);
    getConditions(character);
    getPactUsed(character);
    getLevel(character);

    return character as Character;
  } catch {
    return defaults();
  }
}

function getAttacks(character: any) {
  character.attacks = (character.attacks || []).map((a: any) => {
    const na: any = Object.assign(newAttack(), a);
    if (a.atk !== undefined && a.misc === undefined) na.misc = a.atk;
    na.damage = (typeof a.damage === "string")
      ? Object.assign(newDamage(), { type: a.damage })
      : Object.assign(newDamage(), a.damage || {});
    return na;
  });

  if (!character.attacks.length) character.attacks = [newAttack()];
}

function getProficiencies(character: any) {
  Object.keys(character.skillProfs || {}).forEach((k) => {
    character.skillProfs[k] = character.skillProfs[k] === true
      ? 1
      : (Number(character.skillProfs[k]) || 0);
  });

  character.profList = Array.isArray(character.profList) ? character.profList : (
    getOtherProficiencies(character)
  );
}

function getOtherProficiencies(c: any): any {
  return typeof c.otherProfs === "string" && c.otherProfs.trim()
    ? c.otherProfs.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];
}

function getFeatures(character: any) {
  character.features = (character.features || []).map((f: any) => Object.assign(
    newFeature(),
    { id: f.id || crypto.randomUUID() },
    f,
    f.metric ? {} : { metric: f.tracked ? "uses" : "none" }
  )
  );
}

function getEquipment(character: any) {
  if (typeof character.equipment === "string") {
    const s = character.equipment.trim();
    character.equipment = s
      ? [Object.assign(newEquip(), { name: "Notes", desc: s })]
      : [];
  }

  character.equipment = (character.equipment || []).map((e: any) => Object.assign(newEquip(), { id: e.id || crypto.randomUUID() }, e)
  );
}

function getSpellLevels(character: any) {
  if (!Array.isArray(character.spellLevels) || character.spellLevels.length !== 10) {
    character.spellLevels = emptySpellLevels();
  }

  character.spellLevels = character.spellLevels.map((spellLevel: any) => ({
    slotsTotal: spellLevel.slotsTotal || "",
    slotsUsed: spellLevel.slotsUsed || 0,
    spells: (spellLevel.spells || []).map((spell: any) => {
      const thisSpell: any = Object.assign(newSpell(), spell);
      thisSpell.damage = Object.assign(newDamage(), (spell?.damage) || {});
      return thisSpell;
    }),
  }));
}

function getSpeeds(character: any) {
  character.speeds = {
    walk: "",
    fly: "",
    swim: "",
    climb: "",
    burrow: "",
    ...character.speeds,
  };

  if (!character.speeds.walk && typeof character.speed === "string") character.speeds.walk = character.speed;
  character.speedShow = {
    fly: false,
    swim: false,
    climb: false,
    burrow: false, 
    ...character.speedShow
  };
}

function getClasses(character: any) {
  const classInfo = {
      hitDie: new RegExp(/\d+/).exec(String(character.hitDieType || "")) || (character.hitDieType = "8"),
      caster: "none",
    };

  if (!Array.isArray(character.classes) || !character.classes.length) {
    const nm = String(character.clazz || "").replace(/\s*\d+\s*$/, "").trim();
    const info = CLASS_INFO[nm] || classInfo;
    
    const level = levelFromXP(character.xp) || 1;

    const hdRemaining = (character.hitDiceRemaining !== "" && character.hitDiceRemaining != null &&
      !Number.isNaN(Number(character.hitDiceRemaining)))
      ? Number(character.hitDiceRemaining)
      : level;
      
    character.classes = nm
      ? [
        Object.assign(newClass(), {
          name: nm,
          level: level,
          hitDie: info.hitDie,
          caster: info.caster,
          hdRemaining: hdRemaining,
        }),
      ]
      : [];
  }

  character.classes = (character.classes || []).map((x: any) => Object.assign(newClass(), x));
}

function getInnateSpells(character: any) {
  character.innate = Array.isArray(character.innate)
    ? character.innate.map((x: any) => {
      const o: any = Object.assign(newInnate(), x);
      if (!o.origin && x && typeof x.source === "string" && x.source &&
        !["pb", "ability", "level", "fixed", "formula"].includes(x.source)) {
        o.origin = x.source;
        o.source = "fixed";
      }
      return o;
    })
    : [];
}

function getAttuned(character: any) {
  character.attuned = Array.isArray(character.attuned)
    ? character.attuned.slice(0, 3).map((s: any) => String(s ?? ""))
    : ["", "", ""];

  while (character.attuned.length < 3) character.attuned.push("");
}

function getSenses(character: any) {
    ["senses", "resistances", "immunities"].forEach((k) => {
    if (!Array.isArray(character[k])) character[k] = [];
  });
}

function getConditions(character: any) {
  character.conditions = (character.conditions && typeof character.conditions === "object")
    ? character.conditions
    : {};

  character.exhaustion = Math.max(0, Math.min(6, Number(character.exhaustion) || 0));

  character.autoSlots = character.autoSlots !== undefined ? !!character.autoSlots : true;
}

function getPactUsed(character: any) {
  character.pactUsed = Number(character.pactUsed) || 0;
}

function getLevel(character: any) {
  character.level = character.classes.length
    ? character.classes.reduce((n: number, x: any) => n + (Number(x.level) || 0), 0)
    : levelFromXP(character.xp);

  if (!character.level) character.level = 1;
}