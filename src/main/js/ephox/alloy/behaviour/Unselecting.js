define(
  'ephox.alloy.behaviour.Unselecting',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, EventHandler, DomDefinition, DomModification, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var behaviourName = 'unselecting';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.defaulted(false),
      ValueSchema.anyValue()
    );

    var doesExhibit = function (base) {
      // Don't care about base for this one.
      return DomModification.nu({
        styles: {
          '-webkit-user-select': 'none',
          'user-select': 'none',
          '-ms-user-select': 'none',
          '-moz-user-select': '-moz-none'
        },
        attributes: {
          'unselectable': 'on'
        }
      });
    };

    var exhibit = function (info, base) {
      // change the base definition to exhibit this behaviour
      return info[behaviourName]() === true ? doesExhibit(base) : DomModification.nu({});
    };

    var handlers = function (info) {
      return info[behaviourName]() === true ? {
        selectstart: EventHandler.nu({
          run: function (component, simulatedEvent) {          
            simulatedEvent.event().kill();
            simulatedEvent.stop();
          }
        })
      } : { };
    };

    return Behaviour.contract({
      name: Fun.constant(behaviourName),
      exhibit: exhibit,
      handlers: handlers,
      apis: Fun.constant({ }),
      schema: Fun.constant(schema)
    });
  }
);