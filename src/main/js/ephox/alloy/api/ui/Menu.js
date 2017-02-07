define(
  'ephox.alloy.api.ui.Menu',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.alloy.ui.schema.MenuSchema',
    'ephox.alloy.ui.single.MenuSpec',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (UiBuilder, UiSubstitutes, MenuSchema, MenuSpec, Merger, Fun) {
    

    var build = function (spec) {
      return UiBuilder.single(MenuSchema.name(), MenuSchema.schema(), MenuSpec.make, spec);
    };

    var parts = {
      items: Fun.constant({
        uiType: UiSubstitutes.placeholder(), name: '<alloy.menu.items>', owner: 'menu' 
      })
    };

    var itemType = function (type) {
      return function (spec) {
        return Merger.deepMerge(spec, { type: type });
      };
    };

    return {
      build: build,
      parts: Fun.constant(parts),

      item: itemType('item'),
      widget: itemType('widget'),
      separator: itemType('separator')
    };
  }
);