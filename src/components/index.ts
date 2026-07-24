// Native web components for the chrome shared by every page.
// They render into light DOM (no shadow root) so the sheet's
// stylesheet and theme variables apply to them directly, and so
// Alpine never has to reach across a shadow boundary — the page
// content stays Alpine's, the chrome is the components'.

import { SheetFooter } from "./SheetFooter";
import { SheetNav } from "./SheetNav";
import { SheetToolbar } from "./SheetToolbar";
import { ThemeToggle } from "./ThemeToggle";

const components = {
  "sheet-footer": SheetFooter,
  "sheet-nav": SheetNav,
  "sheet-toolbar": SheetToolbar,
  "theme-toggle": ThemeToggle,
};

export function registerComponents() {
  Object.entries(components).forEach(([name, cls]) => {
    if (!customElements.get(name)) {
      customElements.define(name, cls);
    }
  });
}

