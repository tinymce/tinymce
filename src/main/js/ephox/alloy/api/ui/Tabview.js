define(
  'ephox.alloy.api.ui.Tabview',

  [
    'ephox.alloy.api.ui.UiBuilder'
  ],

  function (UiBuilder) {
    var schema = [ ];
    var partTypes = [ ];

    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'custom',
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
      // TODO: Reconsider if this should stay composite.
      return UiBuilder.composite('tab-view', schema, partTypes, make, f);
    };

    return {
      build: build
    };
  }
);