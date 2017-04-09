define(
  'tinymce.themes.mobile.util.SkinLoaded',

  [

  ],

  function () {
    var fireSkinLoaded = function (editor) {
      var done = function () {
        editor._skinLoaded = true;
        editor.fire('SkinLoaded');
      };

      return function () {
        if (editor.initialized) {
          done();
        } else {
          editor.on('init', done);
        }
      };
    };

    return {
      fireSkinLoaded: fireSkinLoaded
    };
  }
);
