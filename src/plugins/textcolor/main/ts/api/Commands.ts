import TextColor from '../core/TextColor';

var register = function (editor) {
  editor.addCommand('mceApplyTextcolor', function (format, value) {
    TextColor.applyFormat(editor, format, value);
  });

  editor.addCommand('mceRemoveTextcolor', function (format) {
    TextColor.removeFormat(editor, format);
  });
};

export default {
  register
};
