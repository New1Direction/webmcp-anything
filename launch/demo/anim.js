// Shared animation primitives for all demo HTMLs.
// Loaded as <script src="anim.js"></script>, exposes window.anim.{...}

(function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Type text into an element one char at a time with optional blinking
  // cursor. Returns when typing finishes; caller controls dwell.
  async function typeInto(el, text, charDelay = 22, showCursor = true) {
    el.innerHTML = "";
    const cursor = document.createElement("span");
    if (showCursor) {
      cursor.className = "blink-cursor";
      cursor.textContent = "▎";
      el.appendChild(cursor);
    }
    for (const ch of text) {
      const node = document.createTextNode(ch);
      el.insertBefore(node, cursor);
      // scroll the nearest scrollable ancestor
      const scroller = el.closest("[data-scroller]") || el.parentElement;
      if (scroller && scroller.scrollHeight > scroller.clientHeight) {
        scroller.scrollTop = scroller.scrollHeight;
      }
      await sleep(charDelay);
    }
    if (showCursor) cursor.remove();
  }

  // Safe wrapper for operations that may race a navigation.
  async function safe(fn) {
    try { return await fn(); } catch { return null; }
  }

  // Simple JSON pretty-print with optional syntax classes (CSS-styled).
  function highlightJson(obj) {
    const json = JSON.stringify(obj, null, 2);
    return json
      .replace(/("([^"\\]|\\.)*")\s*:/g, '<span class="jk">$1</span>:')
      .replace(/:\s*("([^"\\]|\\.)*")/g, ': <span class="js">$1</span>')
      .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="jn">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="jb">$1</span>')
      .replace(/:\s*null/g, ': <span class="jd">null</span>');
  }

  window.anim = { sleep, typeInto, safe, highlightJson };
})();

// Shared styles for syntax highlighting (gets included once via the html files).
const style = document.createElement("style");
style.textContent = `
  .jk { color: #f0abfc; }   /* keys */
  .js { color: #4ade80; }   /* strings */
  .jn { color: #5bc0eb; }   /* numbers */
  .jb { color: #cc785c; }   /* booleans */
  .jd { color: #6b6b78; }   /* null */
  .blink-cursor {
    display: inline-block; width: 0.55em; color: inherit;
    animation: __blink .9s infinite step-end;
  }
  @keyframes __blink { 50% { opacity: 0; } }
`;
document.head.appendChild(style);
