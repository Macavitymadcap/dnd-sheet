// Tiny Markdown renderer for note fields: inline code, bold, italic,
// links, and bulleted/numbered lists. Escapes HTML first.

function esc(s: unknown): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function mdInline(s: string): string {
  return s.replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

export function mdToHtml(src: unknown): string {
  if (!src || !String(src).trim()) return '<span class="muted">Nothing yet…</span>';
  const lines = esc(src).split(/\r?\n/);
  let html = '';
  let list: 'ul' | 'ol' | null = null;
  const flush = () => { if (list) { html += '</' + list + '>'; list = null; } };
  lines.forEach(line => {
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      if (list !== 'ul') { flush(); html += '<ul class="md-list">'; list = 'ul'; }
      html += '<li>' + mdInline(m[1]) + '</li>';
    } else if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) {
      if (list !== 'ol') { flush(); html += '<ol class="md-list">'; list = 'ol'; }
      html += '<li>' + mdInline(m[1]) + '</li>';
    } else if (line.trim() === '') {
      flush();
    } else {
      flush(); html += '<div>' + mdInline(line) + '</div>';
    }
  });
  flush();
  return html;
}
