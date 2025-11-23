document.addEventListener('DOMContentLoaded', function() {

  /* =========================================
     1. MOBILE MENU LOGIC
     ========================================= */
  const menuBtn = document.querySelector('.sv-header__menu-btn');
  const navWrapper = document.querySelector('.sv-nav-wrapper');
  const body = document.body;

  if (menuBtn && navWrapper) {
    let backdrop = document.querySelector('.sv-menu-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sv-menu-backdrop';
      document.body.appendChild(backdrop);
    }

    const navLinks = Array.from(navWrapper.querySelectorAll('a'));

    const isMobile = () => window.getComputedStyle(menuBtn).display !== 'none';

    const setMenuState = (open) => {
      navWrapper.dataset.collapsed = open ? 'false' : 'true';
      menuBtn.setAttribute('aria-expanded', String(open));
      body.classList.toggle('sv-menu-open', open);
      backdrop.style.display = open ? 'block' : 'none';
      if (!open) {
        body.style.height = '';
        body.style.overflow = '';
      }
    };

    const closeMenu = () => {
      setMenuState(false);
    };

    const syncMenuForViewport = () => {
      if (isMobile()) {
        setMenuState(false);
      } else {
        navWrapper.dataset.collapsed = 'false';
        menuBtn.setAttribute('aria-expanded', 'false');
        body.classList.remove('sv-menu-open');
        backdrop.style.display = 'none';
      }
    };

    syncMenuForViewport();

    window.addEventListener('resize', syncMenuForViewport, { passive: true });

    menuBtn.addEventListener('click', (event) => {
      if (!isMobile()) return;
      event.preventDefault();
      const shouldOpen = !body.classList.contains('sv-menu-open');
      setMenuState(shouldOpen);
    });

    // --- FIX APPLIED HERE ---
    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        if (!isMobile()) return;
        // Simply close the menu and let the browser handle the link naturally.
        // We removed event.preventDefault() and the setTimeout.
        closeMenu();
      });
    });

    backdrop.addEventListener('click', closeMenu, { passive: true });

    document.addEventListener('click', (event) => {
      if (!body.classList.contains('sv-menu-open')) return;
      const target = event.target;
      if (navWrapper.contains(target) || menuBtn.contains(target)) return;
      closeMenu();
    }, true);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && body.classList.contains('sv-menu-open')) {
        closeMenu();
      }
    });
  }

  /* =========================================
     2. FORM SUBMISSION LOGIC (Keep existing)
     ========================================= */
  // (Wrapped in jQuery as per your original file)
  if (typeof jQuery !== 'undefined') {
    jQuery(document).ready(function ($) {
      var $forms = $('form[action^="https://formsubmit.co/"]');
      if (!$forms.length) return;

      $forms.each(function () {
        var $form = $(this);
        if ($form.data('svAjaxBound')) return;
        $form.data('svAjaxBound', true);

        var $status = $form.find('.sv-form__status');
        if (!$status.length) {
          $status = $('<div class="sv-form__status" aria-live="polite" role="status"></div>');
          $form.append($status);
        }

        var $submitButton = $form.find('[type="submit"]');

        $form.on('submit', function (event) {
          event.preventDefault();
          var originalText = $submitButton.data('original-text') || $submitButton.text();
          $submitButton.data('original-text', originalText);
          $status.removeClass('is-error is-success').text('');
          $form.addClass('is-submitting');
          $submitButton.prop('disabled', true).text('Sending…');

          var actionUrl = $form.attr('action');
          var ajaxUrl = actionUrl.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');

          // Fetch Logic
          fetch(ajaxUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(Object.fromEntries(new FormData($form[0])))
          })
          .then(response => response.json())
          .then(data => {
             $status.addClass('is-success').text('✅ Thanks! Your message has been sent.');
             $form.removeClass('is-submitting')[0].reset();
             $submitButton.prop('disabled', false).text(originalText);
          })
          .catch(error => {
             $status.addClass('is-error').text('⚠️ Sorry, we could not send your message.');
             $form.removeClass('is-submitting');
             $submitButton.prop('disabled', false).text(originalText);
          });
        });
      });
    });
  }
});
