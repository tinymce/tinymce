define(
  'ephox.alloy.ui.common.FieldBase',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Attr'
  ],

  function (EventRoot, Composing, Representing, SystemEvents, EventHandler, Objects, Id, Merger, Option, Attr) {
    var events = function (detail) {
     return Objects.wrap(
        SystemEvents.systemInit(),
        EventHandler.nu({
          run: function (component, simulatedEvent) {
            if (EventRoot.isSource(component, simulatedEvent)) {
              var system = component.getSystem();
              system.getByUid(detail.partUids().label).each(function (label) {
                system.getByUid(detail.partUids().field).each(function (field) {
                  var id = Id.generate(detail.prefix());
                              
                  // TODO: Find a nicer way of doing this.
                  Attr.set(label.element(), 'for', id);
                  Attr.set(field.element(), 'id', id);    
                });
              });          
            }
          }
        })
      );
    };

    var behaviours = function (detail) {
      return Merger.deepMerge(
        {
          representing: {
            store: {
              mode: 'manual',
              getValue: function (container) {
                return Composing.getCurrent(container).bind(function (current) {
                  return Representing.getValue(current);
                });
              },
              setValue: function (container, newValue) {
                Composing.getCurrent(container).each(function (current) {
                  Representing.setValue(current, newValue);
                });
              }
            }
          },
          composing: {
            find: function (container) {
              return container.getSystem().getByUid(detail.partUids().field).fold(Option.none, Option.some);
            }
          }
        },
        detail.fieldBehaviours()
      );
    };

    return {
      events: events,
      behaviours: behaviours
    };
   
  }
);