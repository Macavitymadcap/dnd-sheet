// Dev server. Bun's HTML imports bundle each page's TypeScript and CSS
// on the fly — no separate build step while developing.

import index from "./pages/index.html";
import combat from "./pages/combat.html";
import traits from "./pages/traits.html";
import equipment from "./pages/equipment.html";
import background from "./pages/background.html";
import spells from "./pages/spells.html";

const server = Bun.serve({
  port: 5173,
  development: true,
  routes: {
    "/": index,
    "/index.html": index,
    "/combat.html": combat,
    "/traits.html": traits,
    "/equipment.html": equipment,
    "/background.html": background,
    "/spells.html": spells,
  },
});

console.log(`Character sheet running at ${server.url}`);
