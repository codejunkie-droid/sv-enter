jQuery(document).ready(function ($) {
  var $forms = $('form[action^="https://formsubmit.co/"]');
  if (!$forms.length) {
    return;
  }

  $forms.each(function () {
    var $form = $(this);

    if ($form.data('svAjaxBound')) {
      return;
    }
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

      var handleSuccess = function () {
        $status.removeClass('is-error').addClass('is-success').text('✅ Thanks! Your message has been sent.');
        $form.removeClass('is-submitting');
        $submitButton.prop('disabled', false).text(originalText);
        $form[0].reset();
      };

      var handleError = function (error) {
        $form.removeClass('is-submitting');
        $submitButton.prop('disabled', false).text(originalText);
        $status.removeClass('is-success').addClass('is-error').text('⚠️ Sorry, we could not send your message. Please try again.');
      };

      var submitWithFetch = function (url, options) {
        return fetch(url, options).then(function (response) {
          if (options.mode === 'no-cors') {
            return response;
          }

          if (!response.ok) {
            return response.json().then(function (data) {
              var error = new Error('Response was not OK');
              error.data = data;
              throw error;
            });
          }
          return response.json().catch(function () {
            return {};
          });
        });
      };

      var buildPayload = function () {
        var formData = new FormData($form[0]);
        var payload = {};
        formData.forEach(function (value, key) {
          if (payload[key]) {
            if (!Array.isArray(payload[key])) {
              payload[key] = [payload[key]];
            }
            payload[key].push(value);
          } else {
            payload[key] = value;
          }
        });
        return payload;
      };

      var buildFormData = function () {
        return new FormData($form[0]);
      };

      submitWithFetch(ajaxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(buildPayload())
      })
        .then(handleSuccess)
        .catch(function (error) {
          console.error('FormSubmit AJAX failed:', error);
          return submitWithFetch(actionUrl, {
            method: 'POST',
            body: buildFormData(),
            mode: 'no-cors'
          })
            .then(handleSuccess)
            .catch(function (fallbackError) {
              handleError(fallbackError || error);
            });
        });
    });
  });
});