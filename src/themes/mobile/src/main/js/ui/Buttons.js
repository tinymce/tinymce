define(
  'tinymce.themes.mobile.ui.Buttons',

  [
    'ephox.alloy.api.ui.Button',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Button, Styles) {
    var forToolbarCommand = function (editor, command) {
      return forToolbar(command, function () {
        editor.execCommand(command);
      });
    };

    var forToolbar = function (clazz, action) {
      return Button.sketch({
        dom: {
          tag: 'span',
          classes: [ Styles.resolve('toolbar-button'), Styles.resolve('toolbar-button-' + clazz) ]
        },
        action: action,

        behaviours: {
          unselecting: true
        }
      });
    };

    return {
      forToolbarCommand: forToolbarCommand,
      forToolbar: forToolbar
    };
  }
);