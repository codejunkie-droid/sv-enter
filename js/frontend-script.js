document.addEventListener('DOMContentLoaded', function() {

  /* =========================================
     1. MOBILE MENU LOGIC
     ========================================= */
  const menuBtn = document.querySelector('.sv-header__menu-btn');
  const navWrapper = document.querySelector('.sv-nav-wrapper');
  const body = document.body;

  if (menuBtn && navWrapper) {
    // Create backdrop if it doesn't exist
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

    // Initialize
    syncMenuForViewport();

    // Handle Resize
    window.addEventListener('resize', syncMenuForViewport, { passive: true });

    // Toggle Button Click
    menuBtn.addEventListener('click', (event) => {
      if (!isMobile()) return;
      event.preventDefault();
      event.stopPropagation();
      const shouldOpen = !body.classList.contains('sv-menu-open');
      setMenuState(shouldOpen);
    });

    // --- NEW NAVIGATION LOGIC (The Fix) ---
    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        if (!isMobile()) return;

        const href = link.getAttribute('href');

        // SCENARIO 1: Anchor Links (e.g., "#benefits")
        // These don't reload the page, so we MUST close the menu manually.
        if (href && href.startsWith('#')) {
          closeMenu(); 
        }

        // SCENARIO 2: Real Page Links (e.g., "about.html", "contact.html")
        // We do NOTHING. We do NOT preventDefault. We do NOT close the menu.
        // We let the browser handle the click 100% naturally.
        // The menu will disappear when the new page loads.
      });
    });

    // Close on backdrop click
    backdrop.addEventListener('click', closeMenu, { passive: true });

    // Close on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && body.classList.contains('sv-menu-open')) {
        closeMenu();
      }
    });
  }

  /* =========================================
     2. FORM SUBMISSION LOGIC
     ========================================= */
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
