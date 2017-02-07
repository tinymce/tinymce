define(
  'ephox.alloy.docs.DocsPage',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.docs.SchemaView',
    'ephox.alloy.ui.schema.ButtonSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFind'
  ],

  function (GuiFactory, Gui, SchemaView, ButtonSchema, FieldSchema, ValueSchema, Insert, SelectorFind) {
    return function () {
      var root = Gui.create();

      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var schema = ValueSchema.objOf(ButtonSchema.schema());
      var blah = SchemaView.build([ ButtonSchema.name() ], schema.toDsl());

      var built = GuiFactory.build(blah);
      root.add(built);



      Insert.append(ephoxUi, root.element());
    };
  }
);