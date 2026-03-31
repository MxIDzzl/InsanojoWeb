export function renderBBCode(input: string): string {
  let html = input;

  // Escapar HTML básico primero
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // [b]
  html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>");

  // [i]
  html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>");

  // [u]
  html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "<u>$1</u>");

  // [s]
  html = html.replace(/\[s\]([\s\S]*?)\[\/s\]/gi, "<s>$1</s>");

  // [color=#hex] o [color=nombre]
  html = html.replace(
    /\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi,
    '<span style="color:$1">$2</span>'
  );

  // [size=N] — escala relativa, osu usa 50-200
  html = html.replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/gi, (_, size, content) => {
    const em = (parseInt(size) / 100).toFixed(2);
    return `<span style="font-size:${em}em">${content}</span>`;
  });

  // [img]url[/img]
  html = html.replace(
    /\[img\]([\s\S]*?)\[\/img\]/gi,
    '<img src="$1" style="max-width:100%;display:inline-block;vertical-align:middle;" />'
  );

  // [url=href]texto[/url]
  html = html.replace(
    /\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#7ec8e3;text-decoration:underline;">$2</a>'
  );

  // [url]href[/url]
  html = html.replace(
    /\[url\]([\s\S]*?)\[\/url\]/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#7ec8e3;text-decoration:underline;">$1</a>'
  );

  // [c]código[/c]
  html = html.replace(
    /\[c\]([\s\S]*?)\[\/c\]/gi,
    '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;">$1</code>'
  );

  // [centre]
  html = html.replace(
    /\[centre\]([\s\S]*?)\[\/centre\]/gi,
    '<div style="text-align:center;">$1</div>'
  );

  // [heading]
  html = html.replace(
    /\[heading\]([\s\S]*?)\[\/heading\]/gi,
    '<div style="font-size:1.4em;font-weight:bold;border-bottom:2px solid rgba(255,255,255,0.2);padding-bottom:6px;margin:12px 0;">$1</div>'
  );

  // [notice]
  html = html.replace(
    /\[notice\]([\s\S]*?)\[\/notice\]/gi,
    '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:16px;margin:12px 0;">$1</div>'
  );

  // [spoiler]
  html = html.replace(
    /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi,
    `<details style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;margin:4px 0;">
      <summary style="cursor:pointer;color:rgba(255,255,255,0.5);user-select:none;">Spoiler</summary>
      <div style="margin-top:8px;">$1</div>
    </details>`
  );

  // [list] con [*] items
  html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_, content) => {
    const items = content
      .split(/\[\*\]/)
      .filter((s: string) => s.trim())
      .map((s: string) => `<li style="margin:4px 0;">${s.trim()}</li>`)
      .join("");
    return `<ul style="list-style:disc;padding-left:24px;margin:8px 0;">${items}</ul>`;
  });

  // [profile=id]nombre[/profile] — link a osu!
  html = html.replace(
    /\[profile=(\d+)\]([\s\S]*?)\[\/profile\]/gi,
    '<a href="https://osu.ppy.sh/users/$1" target="_blank" rel="noopener noreferrer" style="color:#ff79c6;text-decoration:underline;">$2</a>'
  );

  // Saltos de línea
  html = html.replace(/\n/g, "<br />");

  return html;
}