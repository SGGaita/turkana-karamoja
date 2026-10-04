(function ($) {
  'use strict';

  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '';
    var units = ['B', 'KB', 'MB', 'GB'];
    var i = 0;
    var size = bytes;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i += 1;
    }
    return Math.round(size * 10) / 10 + ' ' + units[i];
  }

  function attachmentToFile(attachment) {
    var size = attachment.filesizeHumanReadable || formatBytes(attachment.filesizeInBytes);
    return {
      url: attachment.url || '',
      size: size || '',
      language: 'en',
      label: attachment.title || attachment.filename || 'Document',
      filename: attachment.filename || attachment.title || '',
    };
  }

  function renderList($wrap, files) {
    var $list = $wrap.find('.tk-post-files-list');
    var $input = $wrap.find('.tk-post-files-data');
    $list.empty();

    if (!files.length) {
      $list.append('<li class="tk-post-files-empty">' + (window.tkPostFiles?.emptyLabel || 'No files attached.') + '</li>');
    } else {
      files.forEach(function (file, index) {
        var $item = $('<li class="tk-post-files-item"></li>');
        var label = file.filename || file.label || 'Document';
        var meta = file.size ? ' · ' + file.size : '';
        $item.append(
          $('<strong></strong>').text(label),
          $('<span class="tk-post-files-meta"></span>').text(meta),
          $('<br>'),
          $('<a target="_blank" rel="noopener"></a>')
            .attr('href', file.url)
            .text(window.tkPostFiles?.openLabel || 'Open file'),
          ' ',
          $('<button type="button" class="button-link tk-post-files-remove"></button>')
            .text(window.tkPostFiles?.removeLabel || 'Remove')
            .data('index', index)
        );
        $list.append($item);
      });
    }

    $input.val(JSON.stringify(files));
  }

  function initPostFilesPicker() {
    var $wrap = $('.tk-post-files-wrap');
    if (!$wrap.length) {
      return;
    }

    var frame;
    var files = [];

    try {
      files = JSON.parse($wrap.find('.tk-post-files-data').val() || '[]');
    } catch (e) {
      files = [];
    }
    if (!Array.isArray(files)) {
      files = [];
    }

    renderList($wrap, files);

    $wrap.on('click', '.tk-post-files-add', function (e) {
      e.preventDefault();

      if (frame) {
        frame.open();
        return;
      }

      frame = wp.media({
        title: window.tkPostFiles?.pickerTitle || 'Select files',
        button: { text: window.tkPostFiles?.pickerButton || 'Attach files' },
        multiple: true,
      });

      frame.on('select', function () {
        var selection = frame.state().get('selection');
        selection.each(function (attachmentModel) {
          var attachment = attachmentModel.toJSON();
          var entry = attachmentToFile(attachment);
          if (!entry.url) {
            return;
          }
          var exists = files.some(function (f) {
            return f.url === entry.url;
          });
          if (!exists) {
            files.push(entry);
          }
        });
        renderList($wrap, files);
      });

      frame.open();
    });

    $wrap.on('click', '.tk-post-files-remove', function (e) {
      e.preventDefault();
      var index = $(this).data('index');
      files.splice(index, 1);
      renderList($wrap, files);
    });
  }

  $(initPostFilesPicker);
})(jQuery);
