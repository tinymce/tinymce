define(
  'tinymce.themes.mobile.ui.IosContainer',

  [
    'tinymce.themes.mobile.ui.OuterContainer'
  ],

  function (OuterContainer) {
    return function () {
      var alloy = OuterContainer();
      

      return {
        element: alloy.element
      };
    };
  }
);
