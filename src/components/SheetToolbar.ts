/** Rest / export / import actions. Dispatches window events the Alpine
 *  component listens for, so the toolbar needs no knowledge of the model. */
export class SheetToolbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = /*html*/ `
      <div class="toolbar noprint">
        <span class="toolbar-label">Rest</span>
        <button type="button" data-act="sheet-short-rest" title="Refills short-rest uses and Pact slots">Short rest ↻</button>
        <button type="button" data-act="sheet-long-rest" title="Refills everything: HP, ~half hit dice, death saves, spell slots">Long rest ☾</button>
        <span class="toolbar-gap"></span>
        <button type="button" data-act="sheet-export" title="Download this character as a JSON file">Export JSON ⬇</button>
        <button type="button" data-act="import" title="Load a character from a JSON file">Import JSON ⬆</button>
        <input type="file" accept=".json,application/json" hidden>
      </div>`;
    const file = this.querySelector("input[type=file]") as HTMLInputElement;
    this.addEventListener("click", (ev) => {
      const btn = (ev.target as HTMLElement).closest("button[data-act]") as
        | HTMLElement
        | null;
      if (!btn) return;
      const act = btn.dataset.act!;
      if (act === "import") {
        file.click();
        return;
      }
      window.dispatchEvent(new CustomEvent(act));
    });
    file.addEventListener("change", async () => {
      const f = file.files?.[0];
      if (!f) return;
      const text = await f.text();
      window.dispatchEvent(new CustomEvent("sheet-import", { detail: text }));
      file.value = "";
    });
  }
}