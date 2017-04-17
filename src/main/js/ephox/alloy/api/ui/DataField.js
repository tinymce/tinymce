define(
  'ephox.alloy.api.ui.DataField',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.ui.schema.DataFieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Option'
  ],

  function (EventRoot, Behaviour, Composing, Representing, SystemEvents, UiSketcher, EventHandler, DataFieldSchema, Objects, Option) {
    var make = function (detail, spec) {
      return {
        uid: detail.uid(),
        dom: detail.dom(),
        behaviours: Behaviour.derive([
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: detail.getInitialValue()()
            }
          }),
          Composing.config({
            find: Option.some
          })
        ]),
        events: Objects.wrap(
          SystemEvents.attachedToDom(),
          EventHandler.nu({
            run: function (component, simulatedEvent) {
              if (EventRoot.isSource(component, simulatedEvent)) {
                Representing.setValue(component, detail.getInitialValue()());
              }
            }
          })
        )
      };
    };

    var sketch = function (spec) {
      return UiSketcher.single(DataFieldSchema.name(), DataFieldSchema.schema(), make, spec);
    };

    return {
      sketch: sketch
    };
  }
);