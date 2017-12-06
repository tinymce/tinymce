define(
  'tinymce.plugins.textcolor.api.Commands',

  [
    'tinymce.plugins.textcolor.core.TextColor'
  ],

  function (TextColor) {
    var register = function (editor) {
      editor.addCommand('mceApplyTextcolor', function (format, value) {
        TextColor.applyFormat(editor, format, value);
      });

      editor.addCommand('mceRemoveTextcolor', function (format) {
        TextColor.removeFormat(editor, format);
      });
    };

    return {
      register: register
    };
  }
);
