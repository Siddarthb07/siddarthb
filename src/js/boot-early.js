/* Early paint path — non-module so it runs before deferred ES modules. */
(function () {
  function dismissLoader() {
    var loader = document.getElementById('loader');
    var rdy = document.getElementById('bootRdy');
    var bar = document.querySelector('.boot-bar i');
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', dismissLoader, { once: true });
  } else {
    dismissLoader();
  }
})();
