define(
  'ephox.alloy.api.ui.Tabview',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.ui.schema.TabviewSchema'
  ],

  function (UiBuilder, TabviewSchema) {
    var schema = TabviewSchema.schema();
    var partTypes = TabviewSchema.parts();

    var make = function (detail, components, spec, externals) {
      return {
        dom: {
          tag: 'div',
          attributes: {
            role: 'tabpanel'
          }
        },

        behaviours: {
          replacing: { }
        }
      };
    };

    var build = function (f) {
      return UiBuilder.composite(TabviewSchema.name(), schema, partTypes, make, f);
    };

    return {
      build: build
    };
  }
);