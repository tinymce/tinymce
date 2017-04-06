define(
  'ephox.alloy.api.ui.Button',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.ButtonSchema',
    'ephox.katamari.api.Merger'
  ],

  function (UiSketcher, ButtonBase, ButtonSchema, Merger) {
    var make = function (detail, spec) {
      var events = ButtonBase.events(detail.action());

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: detail.components(),
        events: events,
        behaviours: Merger.deepMerge(
          {
            focusing: true,
            keying: {
              mode: 'execution',
              useSpace: true,
              useEnter: true
            }
          },
          detail.buttonBehaviours()
        ),
        domModification: {
          attributes: {
            type: 'button',
            role: detail.role().getOr('button')
          }
        },
        customBehaviours: detail.customBehaviours(),
        eventOrder: detail.eventOrder()
      };
    };

    // Dupe with Tiered Menu
    var sketch = function (spec) {
      return UiSketcher.single(ButtonSchema.name(), ButtonSchema.schema(), make, spec);
    };

    return {
      sketch: sketch
    };
  }
);