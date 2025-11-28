document.addEventListener('DOMContentLoaded', function() {

  /* =========================================
     1. MOBILE MENU LOGIC
     ========================================= */
  const menuToggle = document.querySelector('.sv-header__menu-toggle');
  const headerNav = document.querySelector('.sv-header__nav');
  const siteHeader = document.querySelector('.sv-header');
  const body = document.body;

  if (menuToggle && headerNav) {
    let backdrop = document.querySelector('.sv-header__backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sv-header__backdrop';
      document.body.appendChild(backdrop);
    }

    const navLinks = Array.from(headerNav.querySelectorAll('a'));
    const mobileQuery = window.matchMedia('(max-width: 1024px)');

    const setNavOffset = () => {
      if (!siteHeader) return;
      const { bottom } = siteHeader.getBoundingClientRect();
      document.documentElement.style.setProperty('--sv-nav-top', `${Math.max(bottom, 0)}px`);
    };

    const openMenu = () => {
      setNavOffset();
      menuToggle.setAttribute('aria-expanded', 'true');
      body.classList.add('sv-nav-open');
      if (mobileQuery.matches && window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('sv-nav-open');
    };

    const toggleMenu = () => {
      if (body.classList.contains('sv-nav-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    const syncForViewport = () => {
      if (!mobileQuery.matches) {
        closeMenu();
      }
      setNavOffset();
    };

    menuToggle.addEventListener('click', toggleMenu);

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileQuery.matches) {
          closeMenu();
        }
      });
    });

    backdrop.addEventListener('click', closeMenu, { passive: true });

    window.addEventListener('resize', syncForViewport, { passive: true });
    window.addEventListener('scroll', () => {
      if (body.classList.contains('sv-nav-open')) {
        setNavOffset();
      }
    }, { passive: true });

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', syncForViewport);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(syncForViewport);
    }

    // Set initial offset for first render
    setNavOffset();

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
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
