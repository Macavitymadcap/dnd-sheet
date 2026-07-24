export class SheetFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = /*html*/ `
      <footer class="page-foot noprint">
        <p>
          Auto-saves to this browser · Use your browser's Print to export this
          page as a PDF · Text areas support basic Markdown. Game rules © Wizards
          of the Coast; this is an original sheet layout.
        </p>
      </footer>
    `
  }
}