import { THEME_KEY } from "../model/types";

/** Light / dark switch. Persists the choice; defaults to the OS preference. */
export class ThemeToggle extends HTMLElement {
  connectedCallback() {
    this.innerHTML =
      /*html*/ `<button type="button" class="theme-btn" title="Switch between light and dark"></button>`;
    const btn = this.querySelector("button")!;
    const label = () =>
      btn.textContent = document.documentElement.dataset.theme === "dark"
        ? "☀ Daylight"
        : "☾ Candlelight";
    btn.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark"
        ? "light"
        : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch { /* fine */ }
      label();
    });
    label();
  }
}