define(
  'ephox.alloy.api.ui.Tabview',

  [
    'ephox.alloy.api.ui.CompositeBuilder'
  ],

  function (CompositeBuilder) {
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
      return CompositeBuilder.build('tab-view', schema, partTypes, make, f);
    };

    return {
      build: build
    };
  }
);