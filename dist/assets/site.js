(() => {
  const yearNodes = document.querySelectorAll('[data-year]');
  yearNodes.forEach((node) => { node.textContent = new Date().getFullYear(); });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }));
  }

  const filterButtons = document.querySelectorAll('[data-filter]');
  const projectRows = document.querySelectorAll('[data-category]');
  if (filterButtons.length && projectRows.length) {
    filterButtons.forEach((button) => button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      projectRows.forEach((row) => {
        row.hidden = filter !== 'all' && row.dataset.category !== filter;
      });
    }));
  }
})();
