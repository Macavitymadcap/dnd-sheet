import Alpine from 'alpinejs';
import { registerComponents } from './components';
import { sheet } from './sheet';
import { THEME_KEY } from './model';

// Apply the theme as early as the bundle runs (each page's inline head
// script has already set it pre-paint; this covers first visits and
// keeps the attribute in sync if storage was cleared).
(function initTheme() {
  const stored = (() => { try { return localStorage.getItem(THEME_KEY); } catch { return null; } })();
  document.documentElement.dataset.theme =
    stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
})();

registerComponents();

declare global {
  interface Window { Alpine: typeof Alpine }
}
window.Alpine = Alpine;

Alpine.data('sheet', sheet);
Alpine.start();
