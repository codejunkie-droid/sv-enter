document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.sv-header__menu-btn');
  const navWrapper = document.querySelector('.sv-nav-wrapper');
  
  if (menuBtn && navWrapper) {
    menuBtn.addEventListener('click', () => {
      const isCollapsed = navWrapper.getAttribute('data-collapsed') === 'true';
      navWrapper.setAttribute('data-collapsed', !isCollapsed);
      menuBtn.textContent = isCollapsed ? '✕' : '☰';
    });

    // Close menu when clicking a link
    navWrapper.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navWrapper.setAttribute('data-collapsed', 'true');
        menuBtn.textContent = '☰';
      });
    });
  }
});
