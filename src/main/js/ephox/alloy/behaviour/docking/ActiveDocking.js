define(
  'ephox.alloy.behaviour.docking.ActiveDocking',

  [
    'ephox.alloy.alien.Boxes',
    'ephox.alloy.alien.OffsetOrigin',
    'ephox.alloy.api.data.DragCoord',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.behaviour.docking.Dockables',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.view.Scroll'
  ],

  function (Boxes, OffsetOrigin, DragCoord, AlloyEvents, NativeEvents, SystemEvents, Dockables, Compare, Class, Css, Traverse, Scroll) {
    var events = function (dockInfo) {
      return AlloyEvents.derive([
        AlloyEvents.run(NativeEvents.transitionend(), function (component, simulatedEvent) {
          dockInfo.contextual().each(function (contextInfo) {
            if (Compare.eq(component.element(), simulatedEvent.event().target())) {
              Class.remove(component.element(), contextInfo.transitionClass());
              simulatedEvent.stop();
            }
          });
        }),

        AlloyEvents.run(SystemEvents.windowScroll(), function (component, simulatedEvent) {
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
        })
      ]);
    };

    return {
      events: events
    };
  }
);