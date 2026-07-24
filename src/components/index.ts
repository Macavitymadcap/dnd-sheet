// Native web components for the chrome shared by every page.
// They render into light DOM (no shadow root) so the sheet's
// stylesheet and theme variables apply to them directly, and so
// Alpine never has to reach across a shadow boundary — the page
// content stays Alpine's, the chrome is the components'.

import { STORAGE_KEY, THEME_KEY } from '../model';

const PAGES: [string, string, string][] = [
  ['index', './index.html', 'Character'],
  ['combat', './combat.html', 'Attacks & Defence'],
  ['traits', './traits.html', 'Traits'],
  ['equipment', './equipment.html', 'Equipment'],
  ['background', './background.html', 'Background'],
  ['spells', './spells.html', 'Spellcasting'],
];

function savedNameAndLevel(): { name: string; level: string } {
  try {
    const c = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { name: String(c.name || '').trim() || 'Unnamed adventurer', level: c.level ? `Level ${c.level}` : '' };
  } catch {
    return { name: 'Unnamed adventurer', level: '' };
  }
}

/** Page header: character name, level, page links, theme toggle. */
class SheetNav extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute('current') || 'index';
    const links = PAGES.map(([key, href, label]) =>
      `<a href="${href}" ${key === current ? 'class="current" aria-current="page"' : ''}>${label}</a>`).join('');
    this.innerHTML = /*html*/`
      <header class="nav-shell noprint">
        <div class="nav-ident">
          <span class="nav-name" data-nav-name></span>
          <span class="nav-level" data-nav-level></span>
        </div>
        <nav class="nav-links" aria-label="Sheet pages">${links}</nav>
        <theme-toggle></theme-toggle>
      </header>`;
    this.refresh();
    window.addEventListener('sheet-saved', this.refresh);
  }

  disconnectedCallback() { window.removeEventListener('sheet-saved', this.refresh); }

  refresh = () => {
    const { name, level } = savedNameAndLevel();
    this.querySelector('[data-nav-name]')!.textContent = name;
    this.querySelector('[data-nav-level]')!.textContent = level;
  };
}

/** Rest / export / import actions. Dispatches window events the Alpine
 *  component listens for, so the toolbar needs no knowledge of the model. */
class SheetToolbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = /*html*/`
      <div class="toolbar noprint">
        <span class="toolbar-label">Rest</span>
        <button type="button" data-act="sheet-short-rest" title="Refills short-rest uses and Pact slots">Short rest ↻</button>
        <button type="button" data-act="sheet-long-rest" title="Refills everything: HP, ~half hit dice, death saves, spell slots">Long rest ☾</button>
        <span class="toolbar-gap"></span>
        <button type="button" data-act="sheet-export" title="Download this character as a JSON file">Export JSON ⬇</button>
        <button type="button" data-act="import" title="Load a character from a JSON file">Import JSON ⬆</button>
        <input type="file" accept=".json,application/json" hidden>
      </div>`;
    const file = this.querySelector('input[type=file]') as HTMLInputElement;
    this.addEventListener('click', (ev) => {
      const btn = (ev.target as HTMLElement).closest('button[data-act]') as HTMLElement | null;
      if (!btn) return;
      const act = btn.dataset.act!;
      if (act === 'import') { file.click(); return; }
      window.dispatchEvent(new CustomEvent(act));
    });
    file.addEventListener('change', async () => {
      const f = file.files && file.files[0];
      if (!f) return;
      const text = await f.text();
      window.dispatchEvent(new CustomEvent('sheet-import', { detail: text }));
      file.value = '';
    });
  }
}

/** Light / dark switch. Persists the choice; defaults to the OS preference. */
class ThemeToggle extends HTMLElement {
  connectedCallback() {
    this.innerHTML = /*html*/`<button type="button" class="theme-btn" title="Switch between light and dark"></button>`;
    const btn = this.querySelector('button')!;
    const label = () =>
      btn.textContent = document.documentElement.dataset.theme === 'dark' ? '☀ Daylight' : '☾ Candlelight';
    btn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(THEME_KEY, next); } catch { /* fine */ }
      label();
    });
    label();
  }
}

export function registerComponents() {
  if (!customElements.get('sheet-nav')) customElements.define('sheet-nav', SheetNav);
  if (!customElements.get('sheet-toolbar')) customElements.define('sheet-toolbar', SheetToolbar);
  if (!customElements.get('theme-toggle')) customElements.define('theme-toggle', ThemeToggle);
}
