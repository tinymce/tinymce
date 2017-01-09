define(
  'ephox.alloy.api.ui.ItemWidget',

  [
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.peanut.Fun'
  ],

  function (UiSubstitutes, Fun) {
    var parts = {
      widget: Fun.constant({
        uiType: UiSubstitutes.placeholder(),
        owner: 'item-widget',
        name: '<alloy.item.widget>'
      })
    };

    return {
      parts: Fun.constant(parts)
    };
  }
);