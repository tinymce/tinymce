define(
  'tinymce.themes.mobile.test.ui.TestSelectors',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    return {
      link: Fun.constant('.tinymce-mobile-icon-link'),
      fontsize: Fun.constant('.tinymce-mobile-icon-font-size')
    };
  }
);
