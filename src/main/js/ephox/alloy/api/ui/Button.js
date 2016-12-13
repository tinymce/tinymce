define(
  'ephox.alloy.api.ui.Button',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (Tagger, SpecSchema, ButtonBase, FieldSchema, Merger, Fun) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.option('action'),
      FieldSchema.option('role')
    ];

    var make = function (detail, spec) {
      
      var events = ButtonBase.events(detail.action());

      return Merger.deepMerge(
        {
          events: events
        },

        {
          behaviours: {
            focusing: true,
            keying: {
              mode: 'execution',
              useSpace: true,
              useEnter: true
            }
          }
        },

        {
          dom: {
            attributes: {
              type: 'button',
              role: detail.role().getOr('button')
            }
          }
        },

        spec, 

        {
          uiType: 'custom'
        }
      );
    };

    // Dupe with Tiered Menu
    var build = function (rawSpec) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('TieredMenu', schema, spec, [ ]);
      return make(detail, spec);
    };

    return {
      build: build,
      partial: Fun.identity
    };
  }
);