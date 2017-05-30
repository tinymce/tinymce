define(
  'ephox.alloy.api.ui.ItemWidget',

  [
    'ephox.alloy.menu.build.WidgetParts',
    'ephox.alloy.parts.AlloyParts',
    'ephox.katamari.api.Fun'
  ],

  function (WidgetParts, AlloyParts, Fun) {
    var parts = AlloyParts.generate(WidgetParts.owner(), WidgetParts.parts());
    
    return {
      parts: Fun.constant(parts)
    };
  }
);