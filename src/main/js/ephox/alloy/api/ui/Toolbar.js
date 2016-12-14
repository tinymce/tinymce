define(
  'ephox.alloy.api.ui.Toolbar',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.data.Fields',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Result'
  ],

  function (BehaviourExport, Replacing, ToolbarGroup, Fields, Tagger, SpecSchema, FieldSchema, Arr, Merger, Result) {
    var schema = [
      FieldSchema.defaulted('shell', true),
      Fields.members([ 'group' ])
    ];

    var make = function (detail, spec) {

      var setGroups = function (toolbar, groups) {
        getGroupContainer(toolbar).each(function (container) {
          Replacing.set(container, groups);
        });
      };

      var getGroupContainer = function (component) {
        return detail.shell() ? Result.value(component) : component.getSystem().getByUid(
          detail.partUids().groups
        );
      };

      var createGroups = function (toolbar, gspecs) {
        return Arr.map(gspecs, function (grp) {
          return ToolbarGroup.build(
            Merger.deepMerge(
              detail.members().group().munge(grp)
            )
          );
        });
      };

      return Merger.deepMerge(
        {
          uiType: 'custom',
          uid: detail.uid(),
          dom: detail.dom(),
          components: [ ],

          apis: {
            createGroups: createGroups,
            setGroups: setGroups
          }
        }
      );
    };


    var build = function (rawSpec) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('Toolbar', schema, spec, [ ]);
      return make(detail, spec);
    };

    return {
      build: build,
      
      createGroups: function (toolbar, gspecs) {
        var spi = toolbar.config(BehaviourExport.spi());
        return spi.createGroups(toolbar, gspecs);
      },

      setGroups: function (toolbar, gspecs) {
        var spi = toolbar.config(BehaviourExport.spi());
        return spi.setGroups(toolbar, gspecs);
      }
    };
  }
);