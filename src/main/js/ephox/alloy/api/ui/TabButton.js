define(
  'ephox.alloy.api.ui.TabButton',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.TabButtonSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.epithet.Id',
    'ephox.highway.Merger'
  ],

  function (UiBuilder, Tagger, SpecSchema, ButtonBase, TabButtonSchema, FieldSchema, Id, Merger) {
    var schema = TabButtonSchema.schema();

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
    var build = function (spec) {
      return UiBuilder.single(TabButtonSchema.name(), schema, make, spec);
    };

    return {
      build: build
    };
  }
);