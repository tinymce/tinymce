define(
  'ephox.alloy.api.ui.TabButton',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.epithet.Id',
    'ephox.highway.Merger'
  ],

  function (Tagger, SpecSchema, ButtonBase, FieldSchema, Id, Merger) {
    var schema = [
      FieldSchema.strict('value'),
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
            },
            representing: {
              store: {
                mode: 'memory',
                initialValue: detail.value()
              }
            }
          }
        },

        {
          dom: {
            attributes: {
              type: 'button',
              id: Id.generate('aria'),
              role: detail.role().getOr('tab')
            }
          }
        },

        spec
      );
    };

    // Dupe with Button
    var build = function (rawSpec) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('TabButton', schema, spec, [ ]);
      return make(detail, spec);
    };

    return {
      build: build
    };
  }
);