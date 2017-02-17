define(
  'ephox.alloy.api.ui.TabButton',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.TabButtonSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger'
  ],

  function (UiSketcher, Tagger, SpecSchema, ButtonBase, TabButtonSchema, FieldSchema, Id, Merger) {
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
    var sketch = function (spec) {
      return UiSketcher.single(TabButtonSchema.name(), schema, make, spec);
    };

    return {
      sketch: sketch
    };
  }
);