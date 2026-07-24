// The Alpine component behind every page. Each page renders one panel
// of the sheet; they all share this component and the saved character.

import {
  ABILITIES,
  BACKGROUND_FIELDS,
  casterLevel,
  CLASS_INFO,
  CONDITIONS,
  EXHAUST_EFFECTS,
  levelFromXP,
  MULTICLASS_SLOTS,
  PACT,
  SKILLS,
  SPEED_TYPES,
  warlockLevel,
} from "./rules";
import { type Character, STORAGE_KEY } from "./model/types";
import {
  newAttack,
  newClass,
  newDamageText,
  newEquip,
  newFeature,
  newInnate,
  newSpell,
  save,
} from "./model/create";
import { load } from "./model/load";
import { evalFormula } from "./lib/formula";
import { mdToHtml } from "./lib/markdown";

export function sheet() {
  return {
    c: load() as Character,
    preview: {} as Record<string, boolean>,
    drafts: { senses: "", resistances: "", immunities: "" } as Record<
      string,
      string
    >,
    profDraft: "",
    chipGroups: [
      {
        key: "senses",
        label: "Senses",
        dl: "dl-senses",
        ph: "e.g. Darkvision 60 ft",
      },
      {
        key: "resistances",
        label: "Resistances",
        dl: "dl-resist",
        ph: "Damage type…",
      },
      {
        key: "immunities",
        label: "Immunities",
        dl: "dl-immune",
        ph: "Damage type or condition…",
      },
    ],

    // Rules data and factories the templates reference directly.
    ABILITIES: ABILITIES,
    SPEED_TYPES,
    CONDITIONS,
    EXHAUST_FX: EXHAUST_EFFECTS,
    BG_FIELDS: BACKGROUND_FIELDS,
    newFeature,
    newEquip,
    newInnate,
    newAttack,
    newSpell,
    dmgText: newDamageText,
    mdToHtml,

    init() {
      this.$watch("c", () => this.save());
    },
    save() {
      save(this.c);
      window.dispatchEvent(
        new CustomEvent("sheet-saved", {
          detail: { name: this.c.name, level: this.c.level },
        }),
      );
    },

    // ---- core maths ----
    mod(k: string) {
      return Math.floor(((Number(this.c.abilities[k]) || 10) - 10) / 2);
    },
    pb() {
      return Math.floor(((Number(this.c.level) || 1) - 1) / 4) + 2;
    },
    fmt(n: number) {
      return (n >= 0 ? "+" : "") + n;
    },
    spm() {
      return this.mod(this.c.spellAbility || "int");
    },
    syncLevel() {
      const c = this.c;
      c.level = c?.classes?.length
        ? c.classes.reduce((n: number, x: any) => n + (Number(x.level) || 0), 0)
        : levelFromXP(c.xp);
      if (!c.level) c.level = 1;
    },
    skillsFor(ab: string) {
      return SKILLS.filter((s) => s[2] === ab);
    },
    skillBonus(key: string) {
      const s = SKILLS.find((x) => x[0] === key)!;
      const lvl = Number(this.c.skillProfs[key]) || 0;
      return this.mod(s[2]) + lvl * this.pb();
    },
    saveBonus(k: string) {
      return this.mod(k) + (this.c.saveProfs[k] ? this.pb() : 0);
    },
    initiative() {
      const c = this.c;
      const ov = c.initOverride;
      return (ov !== "" && ov != null)
        ? ov
        : this.fmt(this.mod("dex") + (Number(c.initBonus) || 0));
    },

    // ---- metric trackers (features / equipment / innate) ----
    mVal(o: any): number {
      const c = this.c;
      switch (o.source) {
        case "pb":
          return this.pb();
        case "ability":
          return Math.max(0, this.mod(o.ability || "wis"));
        case "level":
          return Number(c.level) || 0;
        case "fixed":
          return Math.max(0, Number(o.fixed) || 0);
        case "formula":
          return evalFormula(o.formula, {
            PB: this.pb(),
            LEVEL: Number(c.level) || 0,
            STR: this.mod("str"),
            DEX: this.mod("dex"),
            CON: this.mod("con"),
            INT: this.mod("int"),
            WIS: this.mod("wis"),
            CHA: this.mod("cha"),
          });
        default:
          return 0;
      }
    },
    mCur(o: any) {
      return Math.min(o.current || 0, this.mVal(o));
    },
    setUses(o: any, n: number) {
      o.current = Math.max(0, Math.min(this.mVal(o), n));
    },
    seedUses(o: any) {
      if (o.metric === "uses" && o.current <= 0) o.current = this.mVal(o);
    },
    mBadge(o: any) {
      const v = this.mVal(o);
      if (o.metric === "uses") return this.mCur(o) + "/" + v;
      if (o.metric === "dice") return v + "d" + (o.dieSize || "6");
      if (o.metric === "bonus") return this.fmt(v);
      return "";
    },
    pipCount(o: any) {
      const v = this.mVal(o);
      return (o.metric === "uses" && v > 0 && v <= 12) ? v : 0;
    },
    pipClick(o: any, i: number) {
      this.setUses(o, this.mCur(o) === i ? i - 1 : i);
    },

    // ---- classes & hit dice ----
    addClass() {
      this.c.classes.push(newClass());
      this.syncLevel();
    },
    removeClass(id: string) {
      this.c.classes = this.c.classes.filter((k: any) => k.id !== id);
      this.syncLevel();
    },
    classNamed(x: any) {
      const info = CLASS_INFO[x.name];
      if (info) {
        x.hitDie = info.hitDie;
        x.caster = info.caster;
      }
    },
    clampHd(x: any) {
      const cap = Number(x.level) || 0;
      if ((Number(x.hdRemaining) || 0) > cap) x.hdRemaining = cap;
    },
    classHd(x: any, d: number) {
      const cap = Number(x.level) || 0;
      x.hdRemaining = Math.max(
        0,
        Math.min(cap, (Number(x.hdRemaining) || 0) + d),
      );
    },
    hdText(x: any) {
      const cap = Number(x.level) || 0;
      return Math.max(0, Math.min(cap, Number(x.hdRemaining) || 0)) + " / " +
        cap + "d" + x.hitDie;
    },
    regainHD(n: number) {
      let left = n;
      for (const x of this.c.classes) {
        const cap = Number(x.level) || 0;
        let r = Number(x.hdRemaining) || 0;
        while (r < cap && left > 0) {
          r++;
          left--;
        }
        x.hdRemaining = r;
        if (left <= 0) break;
      }
    },

    // ---- hit points ----
    hpDelta(n: number) {
      const c = this.c;
      const max = Number(c.hpMax);
      let cur = Number(c.hpCurrent) || 0;
      if (n < 0) {
        let dmg = -n;
        let temp = Number(c.hpTemp) || 0;
        const fromTemp = Math.min(temp, dmg);
        temp -= fromTemp;
        dmg -= fromTemp;
        c.hpTemp = temp > 0 ? temp : "";
        cur = cur - dmg;
      } else {
        cur = cur + n;
      }
      if (cur < 0) cur = 0;
      if (!Number.isNaN(max) && c.hpMax !== "" && cur > max) cur = max;
      c.hpCurrent = cur;
    },
    clampHp() {
      const c = this.c;
      if (c.hpCurrent === "") return;
      let n = Number(c.hpCurrent);
      const max = Number(c.hpMax);
      if (n < 0) n = 0;
      if (!Number.isNaN(max) && c.hpMax !== "" && n > max) n = max;
      c.hpCurrent = n;
    },

    // ---- conditions & exhaustion ----
    exLevel() {
      return Math.max(0, Math.min(6, Number(this.c.exhaustion) || 0));
    },
    exhaustSet(i: number) {
      const ex = this.exLevel();
      this.c.exhaustion = (ex === i) ? i - 1 : i;
    },

    // ---- chips ----
    addChip(key: string) {
      const v = (this.drafts[key] || "").trim();
      if (!v) return;
      (this.c as any)[key].push(v);
      this.drafts[key] = "";
    },
    addProf() {
      const v = (this.profDraft || "").trim();
      if (!v) return;
      this.c.profList.push(v);
      this.profDraft = "";
    },

    // ---- attacks ----
    atkTotal(a: any) {
      return this.fmt(
        (a.prof ? this.pb() : 0) + (a.ability ? this.mod(a.ability) : 0) +
          (Number(a.misc) || 0),
      );
    },

    // ---- equipment ----
    equipSub(e: any) {
      const qty = Number(e.qty) || 1;
      const w = Number(e.weight) || 0;
      return (qty > 1 ? "×" + qty + " " : "") +
        (w ? ((Math.round(qty * w * 100) / 100) + " lb") : "");
    },
    totalWeight() {
      return (Math.round(
        this.c.equipment.reduce(
          (n: number, e: any) =>
            n + (Number(e.qty) || 1) * (Number(e.weight) || 0),
          0,
        ) * 100,
      ) / 100) + " lb";
    },
    capacity() {
      return ((Number(this.c.abilities.str) || 10) * 15) + " lb";
    },
    attunedCount() {
      return this.c.attuned.filter((s: string) => String(s).trim()).length;
    },

    // ---- spellcasting ----
    casterLvl() {
      return casterLevel(this.c.classes);
    },
    autoOn() {
      return !!this.c.autoSlots && this.casterLvl() > 0;
    },
    slotTotal(lvl: number) {
      if (lvl === 0) return 0;
      if (this.autoOn()) {
        const row =
          MULTICLASS_SLOTS[Math.min(20, Math.max(1, this.casterLvl()))] || [];
        return row[lvl - 1] || 0;
      }
      return Number(this.c.spellLevels[lvl].slotsTotal) || 0;
    },
    slotsText(lvl: number) {
      const t = this.slotTotal(lvl);
      const u = Math.min(Number(this.c.spellLevels[lvl].slotsUsed) || 0, t);
      return (t - u) + " / " + t;
    },
    slotStep(lvl: number, d: number) {
      const s = this.c.spellLevels[lvl];
      const t = this.slotTotal(lvl);
      s.slotsUsed = Math.max(0, Math.min(t, (Number(s.slotsUsed) || 0) + d));
    },
    preparedCount() {
      return this.c.spellLevels.slice(1).reduce(
        (n: number, s: any) =>
          n + s.spells.filter((x: any) => x.prepared).length,
        0,
      );
    },
    spellTags(sp: any) {
      const t = newDamageText(sp.damage);
      return [
        sp.school,
        t !== "—" ? t : "",
        sp.prepared ? "✓ prepared" : "",
        sp.concentration ? "Conc" : "",
        sp.ritual ? "Ritual" : "",
      ]
        .filter(Boolean).join(" · ");
    },
    pactInfo() {
      const wl = warlockLevel(this.c.classes);
      return wl > 0 ? PACT[Math.min(20, wl)] : null;
    },
    pactUsedC() {
      const p = this.pactInfo();
      return p ? Math.max(0, Math.min(p.n, Number(this.c.pactUsed) || 0)) : 0;
    },
    pactStep(d: number) {
      const p = this.pactInfo();
      if (!p) return;
      this.c.pactUsed = Math.max(
        0,
        Math.min(p.n, (Number(this.c.pactUsed) || 0) + d),
      );
    },
    innateDC(o: any) {
      return 8 + this.pb() + this.mod(o.castAbility || "cha");
    },

    // ---- rests ----
    refill(list: any[], kinds: string[]) {
      list.forEach((o) => {
        if (o.metric === "uses" && kinds.includes(o.reset)) {
          o.current = this.mVal(o);
        }
      });
    },
    shortRest() {
      const c = this.c;
      this.refill(c.features, ["short"]);
      this.refill(c.equipment, ["short"]);
      this.refill(c.innate, ["short"]);
      c.pactUsed = 0;
    },
    longRest() {
      const c = this.c;
      this.refill(c.features, ["short", "long"]);
      this.refill(c.equipment, ["short", "long"]);
      this.refill(c.innate, ["short", "long"]);
      c.pactUsed = 0;
      c.exhaustion = Math.max(0, (Number(c.exhaustion) || 0) - 1);
      if (c.hpMax !== "") c.hpCurrent = Number(c.hpMax);
      c.hpTemp = "";
      c.deathSucc = 0;
      c.deathFail = 0;
      const total = Number(c.level) || 0;
      this.regainHD(Math.max(1, Math.floor(total / 2)));
      c.spellLevels.forEach((s: any) => {
        s.slotsUsed = 0;
      });
    },

    // ---- markdown preview ----
    mdToggle(key: string) {
      this.preview[key] = !this.preview[key];
    },

    // ---- import / export ----
    exportJson() {
      const blob = new Blob([JSON.stringify(this.c, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = ((String(this.c.name || "").trim() || "character").replace(
        /[^\w\- ]+/g,
        "",
      )) + ".json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    },
    importJsonText(text: string) {
      try {
        const obj = JSON.parse(text);
        if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
          throw new Error("bad shape");
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
        this.c = load();
      } catch {
        alert("That file is not a valid character JSON export.");
      }
    },
  };
}
