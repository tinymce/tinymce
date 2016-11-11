define(
  'ephox.alloy.behaviour.Docking',

  [
    'ephox.alloy.alien.OffsetOrigin',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.dragging.DragCoord',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.ego.util.Bounds',
    'ephox.ego.util.Boxes',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Scroll',
    'ephox.sugar.api.Traverse',
    'ephox.sugar.api.Width',
    'global!window'
  ],

  function (OffsetOrigin, SystemEvents, Behaviour, EventHandler, DomModification, DragCoord, FieldPresence, FieldSchema, Objects, ValueSchema, Bounds, Boxes, Fun, Option, Position, Attr, Class, Compare, Css, Height, Location, Scroll, Traverse, Width, window) {
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
        FieldSchema.defaulted('lazyViewport', defaultLazyViewport),
        FieldSchema.strict('leftAttr'),
        FieldSchema.strict('topAttr')
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

    var isPartiallyVisible = function (box, viewport) {
       return box.y() < viewport.bottom() && box.bottom() > viewport.y();
    };

    var isCompletelyVisible = function (box, viewport) {
      return box.y() >= viewport.y() && box.bottom() <= viewport.bottom();
    };

    var getAttr = function (elem, attr) {
      return Attr.has(elem, attr) ? Option.some(Attr.get(elem, attr)) : Option.none();
    };

    var getPrior = function (component, dockInfo) {
      var elem = component.element();
      return getAttr(elem, dockInfo.leftAttr()).bind(function (left) {
        return getAttr(elem, dockInfo.topAttr()).map(function (top) {
          // Only supports position absolute.
          var w = Width.get(component.element());
          var h = Height.get(component.element());
          return Bounds(left, top, w, h);
        });
      });
    };

    var setPrior = function (component, dockInfo, absLeft, absTop) {
      var elem = component.element();
      Attr.set(elem, dockInfo.leftAttr(), absLeft);
      Attr.set(elem, dockInfo.topAttr(), absTop);
    };

    var clearPrior = function (component, dockInfo) {
      var elem = component.element();
      Attr.remove(elem, dockInfo.leftAttr());
      Attr.remove(elem, dockInfo.topAttr());
    };

    var getMorph = function (component, dockInfo, viewport) {
      var doc = Traverse.owner(component.element());
      var scroll = Scroll.get(doc);
      var origin = OffsetOrigin.getOrigin(component, scroll);

      var isDocked = Css.getRaw(component.element(), 'position').is('fixed');
      if (isDocked) {
        return getPrior(component, dockInfo).bind(function (box) {
          // We are fixed, but we previously were absolutely positioned.
          if (isCompletelyVisible(box, viewport)) {
            // Revert it back to absolute
            clearPrior(component, dockInfo);
            return Option.some(
              DragCoord.absolute(box.x(), box.y())
            );

          } else {
            return Option.none();
          }
        });
      } else {
        // We have an element, so we want to get its absolute coordinates to compare with the absolute
        // coordinates of the viewport. 
        var loc = Location.absolute(component.element());
        var box = Bounds(loc.left(), loc.top(), Width.get(component.element()), Height.get(component.element()));
        if (! isCompletelyVisible(box, viewport)) {
          // Convert it to fixed (keeping the x coordinate and throwing away the y coordinate)
          setPrior(component, dockInfo, loc.left(), loc.top());
          // FIX: Move to generic area?
          var coord = DragCoord.absolute(loc.left(), loc.top());
          var asFixed = DragCoord.asFixed(coord, scroll, origin);

          // Check whether we are docking the bottom of the viewport, or the top
          var viewportPt = DragCoord.absolute(viewport.x(), viewport.y());
          var fixedViewport = DragCoord.asFixed(viewportPt, scroll, origin);
          var fixedY = box.y() <= viewport.y() ? fixedViewport.top() : fixedViewport.top() + viewport.height() - box.height();
          return Option.some(DragCoord.fixed(asFixed.left(), fixedY));
        } else {
          return Option.none();
        }
      }
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
                  
                  // Make the dockable component disappear if the context is outside the viewport
                  contextInfo.lazyContext()(component).each(function (context) {
                    var box = Boxes.box(context.element());
                    var isVisible = isPartiallyVisible(box, viewport);
                    var method = isVisible ? appear : disappear;
                    method(component, contextInfo);
                  });

                  getMorph(component, dockInfo, viewport).each(function (morph) {
                    var styles = DragCoord.toStyles(morph);
                    Css.setAll(component.element(), styles);
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