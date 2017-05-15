define(
  'ephox.alloy.behaviour.docking.ActiveDocking',

  [
    'ephox.alloy.alien.Boxes',
    'ephox.alloy.alien.OffsetOrigin',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.behaviour.docking.Dockables',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.api.data.DragCoord',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Scroll',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Boxes, OffsetOrigin, SystemEvents, Dockables, EventHandler, DragCoord, Objects, Class, Compare, Css, Scroll, Traverse) {
    var events = function (dockInfo) {
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
              // Absolute coordinates (considers scroll)
              var viewport = dockInfo.lazyViewport()(component);


              dockInfo.contextual().each(function (contextInfo) {
                // Make the dockable component disappear if the context is outside the viewport
                contextInfo.lazyContext()(component).each(function (elem) {
                  var box = Boxes.box(elem);
                  var isVisible = Dockables.isPartiallyVisible(box, viewport);
                  var method = isVisible ? Dockables.appear : Dockables.disappear;
                  method(component, contextInfo);
                });
              });

              var doc = Traverse.owner(component.element());
              var scroll = Scroll.get(doc);
              var origin = OffsetOrigin.getOrigin(component.element(), scroll);

              Dockables.getMorph(component, dockInfo, viewport, scroll, origin).each(function (morph) {
                var styles = DragCoord.toStyles(morph, scroll, origin);
                Css.setAll(component.element(), styles);
              });
            }
          })
        }
      ]);
    };

    return {
      events: events
    };
  }
);