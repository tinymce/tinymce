define(
  'tinymce.themes.mobile.test.theme.TestTheme',

  [
    'ephox.katamari.api.Fun',
    'tinymce.core.ThemeManager'
  ],

  function (Fun, ThemeManager) {
    var name = 'test';

    var setup = function (alloy, socket) {
      ThemeManager.add(name, function (editor) {
        return {
          renderUI: function (args) {
            editor.fire('SkinLoaded');
            return {
              iframeContainer: socket.element().dom(),
              editorContainer: alloy.element().dom()
            };
          }
        };
      });
    };

    return {
      setup: setup,
      name: Fun.constant(name)
    };
  }
);
