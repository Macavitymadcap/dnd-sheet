import { test, expect } from 'bun:test';
import { Window } from 'happy-dom';

const pages = ['index', 'combat', 'traits', 'equipment', 'background', 'spells'];

for (const p of pages) {
  test(`renders ${p}.html without Alpine errors`, async () => {
    const html = await Bun.file(`pages/${p}.html`).text();
    const win = new Window({ url: 'http://localhost/' + p + '.html' });
    const errors: string[] = [];
    win.console.error = (...a: any[]) => { errors.push(a.map(String).join(' ')); };
    win.console.warn = (...a: any[]) => { errors.push(a.map(String).join(' ')); };
    // strip external scripts/links; we drive the modules ourselves
    win.document.write(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<link[^>]*>/g, ''));
    (globalThis as any).window = win; (globalThis as any).document = win.document;
    (globalThis as any).localStorage = win.localStorage;
    (globalThis as any).CustomEvent = win.CustomEvent; (globalThis as any).HTMLElement = win.HTMLElement;
    (globalThis as any).customElements = win.customElements;
    (globalThis as any).MutationObserver = win.MutationObserver;
    (globalThis as any).Element = win.Element; (globalThis as any).requestAnimationFrame = (f: any) => setTimeout(f, 0);
    (globalThis as any).matchMedia = () => ({ matches: false });
    (globalThis as any).ShadowRoot = win.ShadowRoot;
    (globalThis as any).Node = win.Node;
    (globalThis as any).getComputedStyle = win.getComputedStyle.bind(win);
    (globalThis as any).queueMicrotask = (f: any) => Promise.resolve().then(f);
    
    await import('../src/main.ts?' + p);
    await new Promise(r => setTimeout(r, 100));
    const bad = errors.filter(e => !/Unable to locate|deprecat/i.test(e));
    if (bad.length) console.log(p, bad.slice(0, 4));
    expect(bad.length).toBe(0);
    expect(win.document.querySelector('.nav-shell')).toBeTruthy();
  });
}
