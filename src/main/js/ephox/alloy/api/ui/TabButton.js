define(
  'ephox.alloy.api.ui.TabButton',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.TabButtonSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Focusing, Keying, Representing, UiSketcher, ButtonBase, TabButtonSchema, Fun, Id, Merger) {
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
        behaviours: Behaviour.derive([
          Focusing.config({ }),
          Keying.config({
            mode: 'execution',
            useSpace: true,
            useEnter: true
          }),
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: detail.value()
            }
          })
        ]),

        domModification: detail.domModification()
      };
    };

    // Dupe with Button
    var sketch = function (spec) {
      return UiSketcher.single(TabButtonSchema.name(), schema, make, spec);
    };

    return {
      sketch: sketch,
      schemas: Fun.constant(TabButtonSchema)
    };
  }
);