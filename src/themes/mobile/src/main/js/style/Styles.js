define(
  'tinymce.themes.mobile.style.Styles',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    var prefix = 'tinymce-mobile';

    var resolve = function (p) {
      return prefix + '-' + p;
    };

    return {
      resolve: resolve,
      prefix: Fun.constant(prefix)
    };
  }
);
