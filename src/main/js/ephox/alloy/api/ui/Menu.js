define(
  'ephox.alloy.api.ui.Menu',

  [
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.schema.MenuSchema',
    'ephox.alloy.ui.single.MenuSpec'
  ],

  function (Sketcher, MenuSchema, MenuSpec) {
    return Sketcher.composite({
      name: 'Menu',
      configFields: MenuSchema.schema(),
      partFields: MenuSchema.parts(),
      factory: MenuSpec.make
    });
  }
);