/* Early paint path — non-module so it runs before deferred ES modules. */
(function () {
  function loadFonts() {
    var sheets = [
      'https://fonts.googleapis.com/css2?family=Bowlby+One&family=Bricolage+Grotesque:opsz,wght@12..96,400;700;800&family=Inter:wght@400;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Bangers&family=JetBrains+Mono:wght@400;600;700&family=Special+Elite&display=swap'
    ];
    for (var i = 0; i < sheets.length; i++) {
      var id = 'sbFont' + i;
      if (document.getElementById(id)) continue;
      var link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = sheets[i];
      document.head.appendChild(link);
    }
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
