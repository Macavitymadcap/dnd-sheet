// Quick parity checks on the ported logic (run with: bun test scripts/)
import { describe, expect, test } from 'bun:test';

// Minimal localStorage stub so model.ts loads outside a browser.
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
};
(globalThis as any).window = globalThis;
(globalThis as any).CustomEvent = class { constructor(public type: string, public opts?: any) {} };
(globalThis as any).dispatchEvent = () => true;

const { sheet } = await import('../src/sheet');
const { levelFromXP, casterLevel } = await import('../src/rules');
const { evalFormula } = await import('../src/lib/formula');
const { mdToHtml } = await import('../src/lib/markdown');

describe('rules', () => {
  test('levelFromXP', () => {
    expect(levelFromXP(0)).toBe(1);
    expect(levelFromXP(900)).toBe(3);
    expect(levelFromXP(355000)).toBe(20);
  });
  test('multiclass caster level', () => {
    expect(casterLevel([
      { id: 'a', name: 'Wizard', level: 3, hitDie: '6', caster: 'full', hdRemaining: 3 },
      { id: 'b', name: 'Paladin', level: 5, hitDie: '10', caster: 'half', hdRemaining: 5 },
    ])).toBe(5);
  });
});

describe('formula', () => {
  test('PB + WIS with helpers', () => {
    const vars = { PB: 3, LEVEL: 6, STR: 1, DEX: 2, CON: 2, INT: 0, WIS: 4, CHA: -1 };
    expect(evalFormula('PB + WIS', vars)).toBe(7);
    expect(evalFormula('max(1, floor(LEVEL / 4))', vars)).toBe(1);
    expect(evalFormula('nonsense(', vars)).toBe(0);
  });
});

describe('sheet component', () => {
  test('mods, pb, saves, hp flow', () => {
    const s: any = sheet();
    s.c.abilities.str = 16;
    s.c.classes = [{ id: 'x', name: 'Fighter', level: 5, hitDie: '10', caster: 'none', hdRemaining: 5 }];
    s.syncLevel();
    expect(s.c.level).toBe(5);
    expect(s.pb()).toBe(3);
    expect(s.mod('str')).toBe(3);
    s.c.saveProfs.str = true;
    expect(s.saveBonus('str')).toBe(6);

    s.c.hpMax = 40; s.c.hpCurrent = 40; s.c.hpTemp = 5;
    s.hpDelta(-8); // 5 from temp, 3 from HP
    expect(s.c.hpTemp).toBe('');
    expect(s.c.hpCurrent).toBe(37);
  });

  test('spell slots from multiclass table + long rest', () => {
    const s: any = sheet();
    s.c.classes = [{ id: 'w', name: 'Wizard', level: 5, hitDie: '6', caster: 'full', hdRemaining: 5 }];
    s.syncLevel();
    expect(s.slotTotal(1)).toBe(4);
    expect(s.slotTotal(3)).toBe(2);
    s.slotStep(1, 2);
    expect(s.slotsText(1)).toBe('2 / 4');
    s.c.hpMax = 30; s.c.hpCurrent = 10;
    s.longRest();
    expect(s.c.hpCurrent).toBe(30);
    expect(s.slotsText(1)).toBe('4 / 4');
  });
});

describe('markdown', () => {
  test('escapes and renders lists', () => {
    const html = mdToHtml('- **bold** item\n- `code` <script>');
    expect(html).toContain('<ul class="md-list">');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('&lt;script&gt;');
  });
});
