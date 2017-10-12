define(
  'tinymce.themes.mobile.api.Settings',

  [

  ],

  function () {
    var isSkinDisabled = function (editor) {
      return editor.settings.skin === false;
    };

    return {
      isSkinDisabled: isSkinDisabled
    };
  }
);
