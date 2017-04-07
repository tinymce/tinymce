define(
  'ephox.alloy.api.ui.TabButton',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.TabButtonSchema',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger'
  ],

  function (UiSketcher, ButtonBase, TabButtonSchema, Id, Merger) {
    var schema = TabButtonSchema.schema();

    var make = function (detail, spec) {
      var events = ButtonBase.events(detail.action());

      return {
        dom: Merger.deepMerge(
          detail.dom(),
          {
            attributes: {
              // Really (type=button?)
              type: 'button',
              id: Id.generate('aria'),
              role: detail.role().getOr('tab')
            }
          }
        ),
        components: detail.components(),
        events: events,
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
        },

        domModification: detail.domModification()
      };
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