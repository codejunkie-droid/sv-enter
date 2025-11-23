document.addEventListener('DOMContentLoaded', function() {

  /* =========================================
     1. MOBILE MENU LOGIC (FIXED)
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

    // Check if menu is hidden via CSS
    const isMobileView = () => window.getComputedStyle(menuBtn).display !== 'none';

    const setMenuState = (open) => {
      navWrapper.dataset.collapsed = open ? 'false' : 'true';
      menuBtn.setAttribute('aria-expanded', String(open));
      
      // Toggle the body class for overflow
      if (open) {
        body.classList.add('sv-menu-open');
        backdrop.style.display = 'block';
      } else {
        body.classList.remove('sv-menu-open');
        backdrop.style.display = 'none';
        // Clean up any inline styles left by other scripts
        body.style.height = '';
        body.style.overflow = '';
      }
    };

    const closeMenu = () => {
      setMenuState(false);
    };

    const syncMenuForViewport = () => {
      if (isMobileView()) {
        // We are on mobile: ensure menu is closed by default
        if (!body.classList.contains('sv-menu-open')) {
            setMenuState(false);
        }
      } else {
        // We are on desktop: reset everything
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
      event.preventDefault();
      event.stopPropagation();
      // Check current state based on the class
      const isOpen = body.classList.contains('sv-menu-open');
      setMenuState(!isOpen);
    });

    // --- FIXED NAVIGATION LINKS LOGIC ---
    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        // CRITICAL FIX: Check if menu is OPEN using the attribute, not computed style
        const isMenuOpen = navWrapper.dataset.collapsed === 'false';
        
        // If menu is closed, do nothing (let standard desktop click happen)
        if (!isMenuOpen) return;

        // If menu is OPEN, we must close it immediately
        closeMenu();
        
        // We DO NOT preventDefault().
        // We DO NOT use setTimeout().
        // We let the browser navigate naturally.
        // The menu closes visually instantly, then the page refreshes.
      });
    });

    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent click passing through
        closeMenu();
    }, { passive: false });

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
