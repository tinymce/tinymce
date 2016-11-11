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
    'ephox.ego.util.Bounds',
    'ephox.ego.util.Boxes',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Scroll',
    'global!window'
  ],

  function (SystemEvents, Behaviour, EventHandler, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, Bounds, Boxes, Fun, Class, Compare, Scroll, window) {
    var behaviourName = 'docking';

    var defaultLazyViewport = function (_component) {
      var scroll = Scroll.get();
      return Bounds(scroll.left(), scroll.top(), window.innerWidth, window.innerHeight);
    };

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
        ),
        FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
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
                  // Absolute coordinates (considers scroll)
                  var viewport = dockInfo.lazyViewport()(component);
                  // Absolute coordinates
                  contextInfo.lazyContext()(component).each(function (context) {
                    var box = Boxes.box(context.element());
                    var isVisible = box.y() < viewport.bottom() && box.bottom() > viewport.y();
                    var method = isVisible ? appear : disappear;
                    method(component, contextInfo);
                  });
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