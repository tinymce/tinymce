define(
  'tinymce.themes.mobile.ui.TinyFormatting',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects'
  ],

  function (EventRoot, Behaviour, SystemEvents, EventHandler, FieldSchema, Objects) {
    var schema = [
      FieldSchema.strict('setupValue')
    ];
    var active = {
      events: function (formatInfo) {
        return Objects.wrap(
          SystemEvents.attachedToDom(),
          EventHandler.nu({
            run: function (component, simulatedEvent) {
              if (EventRoot.isSource(component, simulatedEvent)) {
                formatInfo.setupValue()(component);
              }
            }
          })
        );
      }
    };
    var apis = { };

    return Behaviour.create(
      schema,
      'tiny-formatting',
      active,
      apis,
      { }
    );
  }
);
