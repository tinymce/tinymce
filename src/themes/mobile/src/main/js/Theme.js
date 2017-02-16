define(
  'tinymce.themes.mobile.Theme',

  [
    'global!Error',
    'global!window',
    'tinymce.core.ThemeManager',
    'tinymce.core.ui.Api'
  ],

  function (Error, window, ThemeManager, Api) {
    var fail = function (message) {
      throw new Error(message);
    };

    ThemeManager.add('mobile', function (editor) {
      
      var renderUI = function () {
        return fail('this is just a stub');
      };

      return {
        renderUI: renderUI
      };
    });

    Api.appendTo(window.tinymce ? window.tinymce : {});

    return function () { };

  }
);
