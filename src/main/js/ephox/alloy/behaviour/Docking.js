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
        FieldSchema.field(
          'contextual',
          'contextual',
          FieldPresence.asOption(),
          ValueSchema.objOf([
            FieldSchema.strict('fadeInClass'),
            FieldSchema.strict('fadeOutClass'),
            FieldSchema.strict('transitionClass'),
            FieldSchema.strict('lazyContext')
          ])
        )
      ])
    );

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var appear = function (component, contextualInfo) {
      Class.add(component.element(), contextualInfo.transitionClass());
      Class.remove(component.element(), contextualInfo.fadeOutClass());
      Class.add(component.element(), contextualInfo.fadeInClass());
    };

    var disappear = function (component, contextualInfo) {
      Class.add(component.element(), contextualInfo.transitionClass());
      Class.remove(component.element(), contextualInfo.fadeInClass());
      Class.add(component.element(), contextualInfo.fadeOutClass());
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
                dockInfo.contextual().each(function (contextInfo) {
                  if (Compare.eq(component.element(), simulatedEvent.event().target())) {
                    Class.remove(component.element(), contextInfo.transitionClass());
                    simulatedEvent.stop();
                  }
                });
              }
            }) 
          },
          {
            key: SystemEvents.windowScroll(),
            value: EventHandler.nu({
              run: function (component, simulatedEvent) {
                dockInfo.contextual().each(function (contextInfo) {
                  if (window.scrollY > 100) appear(component, contextInfo);
                  else disappear(component, contextInfo);
                });
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