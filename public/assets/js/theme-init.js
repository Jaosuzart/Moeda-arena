(function () {
  const root = document.documentElement;
  try {
    root.classList.toggle('light-theme', localStorage.getItem('theme') === 'light');
  } catch (_) { /* O tema continua funcionando sem armazenamento disponível. */ }
  document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('btnThemeToggle');
    if (!button) return;
    const sync = function () {
      const light = root.classList.contains('light-theme');
      button.setAttribute('aria-pressed', String(light));
      const label = light ? 'Ativar contraste escuro' : 'Ativar contraste claro';
      button.setAttribute('aria-label', label);
      button.title = label;
    };
    sync();
    button.addEventListener('click', function () {
      root.classList.toggle('light-theme');
      try { localStorage.setItem('theme', root.classList.contains('light-theme') ? 'light' : 'dark'); }
      catch (_) {}
      sync();
    });
  });
})();
