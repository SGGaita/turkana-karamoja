(function ($) {
  'use strict';

  var previewLang = 'en';

  function getTaglineForLang(lang) {
    var $field = lang === 'en'
      ? $('#tk-hub-branding-tagline')
      : $('.tk-hub-tagline-translation[data-lang="' + lang + '"]');
    var value = ($field.val() || '').trim();
    if (value) {
      return value;
    }
    return ($('#tk-hub-branding-tagline').val() || 'Climate Change Knowledge and Information').trim();
  }

  function updateNavbarPreview() {
    var title = $('#tk-hub-branding-title').val() || 'Karamoja';
    var tagline = getTaglineForLang(previewLang);
    $('.tk-navbar-mock-title').text(title);
    $('.tk-navbar-mock-tagline').text(tagline);
  }

  function updateCharCount($field) {
    var id = $field.attr('id');
    var max = parseInt($field.attr('maxlength'), 10) || 160;
    var len = ($field.val() || '').length;
    $('.tk-char-count[data-for="' + id + '"]').text(len + ' / ' + max);
  }

  function setLogoPreview(url) {
    var $preview = $('.tk-hub-logo-preview');
    var $placeholder = $('.tk-hub-logo-placeholder');
    var $mockLogo = $('.tk-navbar-mock-logo');
    var $mockFallback = $('.tk-navbar-mock-logo-fallback');
    var $removeBtn = $('.tk-hub-logo-remove');
    var $selectLabel = $('.tk-hub-logo-select-label');

    if (url) {
      $preview.attr('src', url).show();
      $placeholder.hide();
      $mockLogo.attr('src', url).show();
      $mockFallback.hide();
      $removeBtn.prop('disabled', false);
      $selectLabel.text('Change logo');
    } else {
      $preview.attr('src', '').hide();
      $placeholder.show();
      $mockLogo.attr('src', '').hide();
      $mockFallback.show();
      $removeBtn.prop('disabled', true);
      $selectLabel.text('Upload logo');
    }
  }

  function initLogoPicker() {
    var frame;
    var $wrap = $('.tk-hub-logo-picker');
    if (!$wrap.length) {
      return;
    }

    var $input = $('#tk-hub-logo-id');

    $('.tk-hub-logo-select').on('click', function (e) {
      e.preventDefault();

      if (frame) {
        frame.open();
        return;
      }

      frame = wp.media({
        title: 'Select site logo',
        button: { text: 'Use as logo' },
        library: { type: 'image' },
        multiple: false,
      });

      frame.on('select', function () {
        var attachment = frame.state().get('selection').first().toJSON();
        $input.val(attachment.id);
        var url = attachment.sizes && attachment.sizes.medium
          ? attachment.sizes.medium.url
          : attachment.url;
        setLogoPreview(url);
      });

      frame.open();
    });

    $('.tk-hub-logo-remove').on('click', function (e) {
      e.preventDefault();
      $input.val('0');
      setLogoPreview('');
    });
  }

  function initLanguageTabs() {
    $('.tk-lang-tab').on('click', function () {
      var lang = $(this).data('lang');
      $('.tk-lang-tab').removeClass('is-active').attr('aria-selected', 'false');
      $(this).addClass('is-active').attr('aria-selected', 'true');
      $('.tk-lang-panel').removeClass('is-active').attr('hidden', true);
      $('.tk-lang-panel[data-lang-panel="' + lang + '"]').addClass('is-active').removeAttr('hidden');
    });
  }

  function initPreviewLanguageSwitch() {
    $('.tk-preview-lang').on('click', function () {
      previewLang = $(this).data('preview-lang') || 'en';
      $('.tk-preview-lang').removeClass('is-active');
      $(this).addClass('is-active');
      updateNavbarPreview();
    });
  }

  function initLivePreview() {
    $('#tk-hub-branding-title').on('input', updateNavbarPreview);
    $('#tk-hub-branding-tagline, .tk-hub-tagline-translation').on('input', function () {
      updateCharCount($(this));
      if (previewLang === 'en' || $(this).data('lang') === previewLang) {
        updateNavbarPreview();
      }
    });

    $('#tk-hub-branding-tagline, .tk-hub-tagline-translation').each(function () {
      updateCharCount($(this));
    });
  }

  $(function () {
    initLogoPicker();
    initLanguageTabs();
    initPreviewLanguageSwitch();
    initLivePreview();
    updateNavbarPreview();
  });
})(jQuery);
