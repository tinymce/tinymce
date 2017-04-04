define(
  'tinymce.themes.mobile.ui.ToolbarWidgets',

  [
    'tinymce.themes.mobile.ui.Buttons'
  ],

  function (Buttons) {
    var button = function (ios, clazz, makeItems) {
      return Buttons.forToolbar(clazz, function () {
        var items = makeItems();
        ios.setContextToolbar([
          {
            label: 'font-color',
            items: items
          }
        ]);
      }, { }, { });
    };

    return {
      button: button
    };
  }
);
