define(
  'tinymce.themes.mobile.util.CssUrls',

  [
    'ephox.boulder.api.Objects',
    'tinymce.core.EditorManager'
  ],

  function (Objects, EditorManager) {
    var derive = function (editor) {
      var base = Objects.readOptFrom(editor.settings, 'mobile_skin_url').fold(function () {
        return EditorManager.baseURL + '/skins/' + 'lightgray';
      }, function (url) {
        return url;
      });

      return {
        content: base + '/content.css',
        ui: base + '/mobile-less.css'
      };
    };

    return {
      derive: derive
    };
  }
);
