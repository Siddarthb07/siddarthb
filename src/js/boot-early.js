/* Early paint path — non-module so it runs before deferred ES modules. */
(function () {
  function loadFonts() {
    if (document.getElementById('sbFont0')) return;
    var link = document.createElement('link');
    link.id = 'sbFont0';
    link.rel = 'stylesheet';
    link.href = 'src/fonts/fonts.css?v=sb01-1';
    document.head.appendChild(link);
  }

  function dismissLoader() {
    var loader = document.getElementById('loader');
    var log = document.getElementById('bootLog');
    var rdy = document.getElementById('bootRdy');
    var bar = document.querySelector('.boot-bar i');
    var lines = [
      '> printing cover...........<span class="ok">ok</span>',
      '> mixing inks · CMYK......<span class="ok">ok</span>',
      '> stamping halftone.......<span class="ok">ok</span>',
      '> binding 11 pages........<span class="ok">ok</span>',
      '> syncing GitHub index....<span class="ok">live</span>',
      '> mounting widgets........<span class="ok">04</span>',
      '<span class="ok">[ ready ]</span> Issue 001 — scroll to read'
    ];
    if (log) log.innerHTML = lines.join('\n');
    if (bar) bar.style.right = '0%';
    if (rdy) rdy.textContent = 'PRINTED';
    var cover = document.getElementById('cover');
    if (cover) cover.classList.add('in');
    if (!loader || loader.classList.contains('gone')) return;
    loader.classList.add('gone');
    setTimeout(function () {
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    }, 280);
  }

  loadFonts();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', dismissLoader, { once: true });
  } else {
    dismissLoader();
  }
})();
