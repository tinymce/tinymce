define(
  'ephox.alloy.api.ui.common.FieldUtils',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.epithet.Id',
    'ephox.sugar.api.Attr'
  ],

  function (SystemEvents, EventHandler, Objects, Id, Attr) {
    var events = function (detail) {
     return Objects.wrap(
        SystemEvents.systemInit(),
        EventHandler.nu({
          run: function (component) {
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
        })
      );
    };

    return {
      events: events
    };
   
  }
);