/**
 * Inline Edit Mode — portfolio helper
 * Click the pencil button (bottom-right) to edit any text directly on the page.
 * Hit "Save" to download the updated HTML file, then replace the original.
 * Remove this script tag before publishing.
 */
(function () {
  'use strict';

  /* ── Styles ──────────────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #_em {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #_em-toggle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: #1a1a1a;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(0,0,0,0.25);
      transition: background 0.15s, transform 0.15s;
    }
    #_em-toggle:hover { background: #333; transform: scale(1.08); }
    #_em-toggle._em-on { background: #2563eb; }
    #_em-toggle._em-on:hover { background: #1d4ed8; }
    [data-theme="dark"] #_em-toggle { background: #e5e7eb; color: #111; }
    [data-theme="dark"] #_em-toggle:hover { background: #fff; }
    [data-theme="dark"] #_em-toggle._em-on { background: #3b82f6; color: #fff; }

    #_em-save {
      display: none;
      align-items: center;
      gap: 6px;
      padding: 0 16px;
      height: 40px;
      border-radius: 20px;
      border: none;
      background: #16a34a;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(0,0,0,0.2);
      transition: background 0.15s;
    }
    #_em-save:hover { background: #15803d; }

    ._em-editable {
      outline: 2px dashed rgba(37, 99, 235, 0.4) !important;
      border-radius: 3px !important;
      cursor: text !important;
      min-height: 1em;
    }
    ._em-editable:hover {
      outline-color: rgba(37, 99, 235, 0.7) !important;
      background: rgba(37, 99, 235, 0.04) !important;
    }
    ._em-editable:focus {
      outline: 2px solid #2563eb !important;
      background: rgba(37, 99, 235, 0.06) !important;
      border-radius: 3px !important;
    }
  `;
  document.head.appendChild(style);

  /* ── Toolbar HTML ────────────────────────────────────────────────────── */
  const toolbar = document.createElement('div');
  toolbar.id = '_em';
  toolbar.innerHTML = `
    <button id="_em-save">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      Save
    </button>
    <button id="_em-toggle" title="Toggle edit mode">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    </button>
  `;
  document.body.appendChild(toolbar);

  /* ── Element selectors ───────────────────────────────────────────────── */
  const SELECTOR = [
    'h1','h2','h3','h4','h5','h6',  // headings
    'p',                             // paragraphs
    'li',                            // list items
    'blockquote','figcaption',       // misc
    'td','th',                       // tables
    '.meta-val',                     // project meta values (Year, Role, etc.)
    '.meta-label',                   // project meta labels
    '.tl-date',                      // timeline date labels
    '.exp-date',                     // about: date ranges / grad date
    '.exp-role',                     // about: role / institution name
    '.exp-org',                      // about: org / degree name
    '.callout',                      // project: equation / formula boxes
    '.calc-block',                   // project: calculation blocks
    '.fos-number',                   // project: factor-of-safety numbers
    '.fos-desc',                     // project: FoS descriptions
  ].join(',');

  function getEditables() {
    const all = [...document.querySelectorAll(SELECTOR)]
      .filter(el => !el.closest('#_em'));

    // If an element's ancestor is also in the result set, skip it —
    // nested contenteditable breaks things. The outermost container wins.
    const set = new Set(all);
    return all.filter(el => {
      let ancestor = el.parentElement;
      while (ancestor) {
        if (set.has(ancestor)) return false;
        ancestor = ancestor.parentElement;
      }
      return true;
    });
  }

  /* ── Timeline body-text helpers ──────────────────────────────────────── */
  // .tl-item contains a .tl-date div + bare text nodes.
  // We wrap those bare text nodes in <span class="_em-tl"> so they're clickable.

  function wrapTimelineText() {
    document.querySelectorAll('.tl-item').forEach(item => {
      item.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const span = document.createElement('span');
          span.className = '_em-tl';
          span.textContent = node.textContent;
          item.replaceChild(span, node);
        }
      });
    });
    // Style + make editable
    document.querySelectorAll('._em-tl').forEach(el => {
      el.contentEditable = 'true';
      el.classList.add('_em-editable');
    });
  }

  function unwrapTimelineText() {
    document.querySelectorAll('._em-tl').forEach(span => {
      const text = document.createTextNode(span.textContent);
      span.parentNode.replaceChild(text, span);
    });
  }

  /* ── Toggle logic ────────────────────────────────────────────────────── */
  let editing = false;
  const toggleBtn = document.getElementById('_em-toggle');
  const saveBtn   = document.getElementById('_em-save');

  function enterEditMode() {
    editing = true;
    getEditables().forEach(el => {
      el.contentEditable = 'true';
      el.classList.add('_em-editable');
    });
    wrapTimelineText();
    toggleBtn.classList.add('_em-on');
    saveBtn.style.display = 'flex';
    toggleBtn.title = 'Exit edit mode';
  }

  function exitEditMode() {
    editing = false;
    getEditables().forEach(el => {
      el.contentEditable = 'false';
      el.classList.remove('_em-editable');
    });
    // Also clean up any remaining _em-tl spans that weren't unwrapped
    document.querySelectorAll('._em-tl').forEach(el => {
      el.contentEditable = 'false';
      el.classList.remove('_em-editable');
    });
    unwrapTimelineText();
    toggleBtn.classList.remove('_em-on');
    saveBtn.style.display = 'none';
    toggleBtn.title = 'Toggle edit mode';
  }

  toggleBtn.addEventListener('click', () => editing ? exitEditMode() : enterEditMode());

  /* ── Save / download ─────────────────────────────────────────────────── */
  saveBtn.addEventListener('click', function () {
    exitEditMode();

    // Remove toolbar + styles from DOM so they're not serialised
    toolbar.remove();
    style.remove();

    const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    // Re-attach
    document.head.appendChild(style);
    document.body.appendChild(toolbar);

    // Derive filename from current URL
    const filename = location.pathname.split('/').filter(Boolean).pop() || 'index.html';

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
})();
