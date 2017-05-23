define(
  'tinymce.themes.mobile.style.Styles',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    var resolve = function (p) {
      return 'tinymce-mobile-' + p;
    };

    return {
      resolve: resolve,
      prefix: Fun.constant('tinymce-mobile')
    };
  }
);
