define(
  'tinymce.themes.mobile.util.CssUrls',

  [
    'ephox.boulder.api.Objects',
    'tinymce.core.EditorManager'
  ],

  function (Objects, EditorManager) {
    var derive = function (editor) {
      var base = Objects.readOptFrom(editor.settings, 'skin_url').fold(function () {
        return EditorManager.baseURL + '/skins/' + 'lightgray';
      }, function (url) {
        return url;
      });

      return {
        content: base + '/content.mobile.min.css',
        ui: base + '/skin.mobile.min.css'
      };
    };

    return {
      derive: derive
    };
  }
);
