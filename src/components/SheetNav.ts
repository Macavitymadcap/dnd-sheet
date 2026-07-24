import { STORAGE_KEY } from "../model/types";

const PAGES: [string, string, string][] = [
  ["index", "./index.html", "Character"],
  ["combat", "./combat.html", "Attacks & Defence"],
  ["traits", "./traits.html", "Traits"],
  ["equipment", "./equipment.html", "Equipment"],
  ["background", "./background.html", "Background"],
  ["spells", "./spells.html", "Spellcasting"],
];

function savedNameAndLevel(): { name: string; level: string } {
  try {
    const c = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      name: String(c.name || "").trim() || "Unnamed adventurer",
      level: c.level ? `Level ${c.level}` : "",
    };
  } catch {
    return { name: "Unnamed adventurer", level: "" };
  }
}

/** Page header: character name, level, page links, theme toggle. */
export class SheetNav extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current") || "index";
    const links = PAGES.map(([key, href, label]) =>
      `<a href="${href}" ${
        key === current ? 'class="current" aria-current="page"' : ""
      }>${label}</a>`
    ).join("");
    this.innerHTML = /*html*/ `
      <header class="nav-shell noprint">
        <div class="nav-ident">
          <span class="nav-name" data-nav-name></span>
          <span class="nav-level" data-nav-level></span>
        </div>
        <nav class="nav-links" aria-label="Sheet pages">${links}</nav>
        <theme-toggle></theme-toggle>
      </header>`;
    this.refresh();
    window.addEventListener("sheet-saved", this.refresh);
  }

  disconnectedCallback() {
    window.removeEventListener("sheet-saved", this.refresh);
  }

  refresh = () => {
    const { name, level } = savedNameAndLevel();
    this.querySelector("[data-nav-name]")!.textContent = name;
    this.querySelector("[data-nav-level]")!.textContent = level;
  };
}


