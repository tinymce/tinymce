define(
  'tinymce.themes.mobile.ui.ToolbarWidgets',

  [
    'tinymce.themes.mobile.ui.Buttons'
  ],

  function (Buttons) {
    var button = function (realm, clazz, makeItems) {
      return Buttons.forToolbar(clazz, function () {
        var items = makeItems();
        realm.setContextToolbar([
          {
            // FIX: I18n
            label: clazz + ' group',
            items: items
          }
        ]);
      }, { });
    };

    return {
      button: button
    };
  }
);
