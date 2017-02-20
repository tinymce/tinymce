define(
  'tinymce.themes.mobile.ui.IosContainer',

  [
    'tinymce.themes.mobile.toolbar.ScrollingToolbar',
    'tinymce.themes.mobile.ui.OuterContainer'
  ],

  function (ScrollingToolbar, OuterContainer) {
    return function () {
      var alloy = OuterContainer();

      var toolbar = ScrollingToolbar();

      alloy.add(toolbar.wrapper());
      

      return {
        element: alloy.element
      };
    };
  }
);
