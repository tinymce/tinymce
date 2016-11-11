define(
  'ephox.alloy.behaviour.Docking',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css'
  ],

  function (SystemEvents, Behaviour, EventHandler, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, Fun, Class, Compare, Css) {
    var behaviourName = 'docking';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.strict('fadeInClass'),
        FieldSchema.strict('fadeOutClass'),
        FieldSchema.strict('transitionClass')
      ])
    );

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var appear = function (component, dockInfo) {
      Class.add(component.element(), dockInfo.transitionClass());
      Class.remove(component.element(), dockInfo.fadeOutClass());
      Class.add(component.element(), dockInfo.fadeInClass());
    };

    var disappear = function (component, dockInfo) {
      Class.add(component.element(), dockInfo.transitionClass());
      Class.remove(component.element(), dockInfo.fadeInClass());
      Class.add(component.element(), dockInfo.fadeOutClass());
    };

    var handlers = function (info) {
      var bInfo = info[behaviourName]();
      return bInfo.fold(function () {
        return { };
      }, function (dockInfo) {
        return Objects.wrapAll([
          {
            key: 'transitionend',
            value: EventHandler.nu({
              run: function (component, simulatedEvent) {
                if (Compare.eq(component.element(), simulatedEvent.event().target())) {
                  Class.remove(component.element(), dockInfo.transitionClass());
                  simulatedEvent.stop();
                }
              }
            }) 
          },
          {
            key: SystemEvents.windowScroll(),
            value: EventHandler.nu({
              run: function (component, simulatedEvent) {
                if (window.scrollY > 100) appear(component, dockInfo);
                else disappear(component, dockInfo);
              }
            })
          }
        ]);
      });
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