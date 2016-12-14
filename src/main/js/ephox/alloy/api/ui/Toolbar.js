define(
  'ephox.alloy.api.ui.Toolbar',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (CompositeBuilder, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('shell', true)
    ];

    var partTypes = [
      PartType.optional({ build: Fun.identity }, 'groups', '<alloy.toolbar.groups>', Fun.constant({ }), Fun.constant({ }))
    ];

    var make = function (detail, components, spec, _externals) {
      var comps = detail.shell() ? [ ] : components;
      return {
        uiType: 'custom',
        uid: detail.uid(),
        dom: detail.dom(),
        components: comps
      };
    };


    var build = function (spec) {
      return CompositeBuilder.build('toolbar', schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('toolbar', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);