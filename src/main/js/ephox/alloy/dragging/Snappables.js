define(
  'ephox.alloy.dragging.Snappables',

  [
    'ephox.alloy.dragging.DragCoord',
    'ephox.alloy.dragging.Presnaps',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'global!Math'
  ],

  function (DragCoord, Presnaps, Option, Options, Math) {
    // Types of coordinates
    // Location: This is the position on the screen including scroll.
    // Absolute: This is the css setting that would be applied. Therefore, it subtracts
    // the origin of the relative offsetParent.
    // Fixed: This is the fixed position.

    /*
     So in attempt to make this more understandable, let's use offset, absolute, and fixed.
     and try and model individual combinators
    */



    /*

  

     Relationships: 
       - location -> absolute: should just need to subtract the position of the offset parent (origin)
       - location -> fixed: subtract the scrolling 
       - absolute -> fixed: add the origin, and subtract the scrolling
       - absolute -> location: add the origin
       - fixed -> absolute: add the scrolling, remove the origin
       - fixed -> location: add the scrolling

    /*
     * When the user is dragging around the element, and it snaps into place, it is important
     * for the next movement to be from its pre-snapped location, rather than the snapped location.
     * This is because if it is from the snapped location the next delta movement may not actually
     * be high enough to get it out of the snap area, and hence, it will just snap again (and again).
     */

    // This identifies the position of the draggable element as either its current position, or the position
    // that we put on it before we snapped it into place (before dropping). Once it's dropped, the presnap
    // position will go away. It is used to avoid the situation where you can't escape the snap unless you
    // move the mouse really quickly :)
    var getCoords = function (component, snapInfo, coord, delta) {
      return Presnaps.get(component, snapInfo).fold(function () {
        return coord;
      }, function (fixed) {
        // We have a pre-snap position, so we have to apply the delta ourselves
        return DragCoord.fixed(fixed.left() + delta.left(), fixed.top() + delta.top());
      });
    };

    var moveOrSnap = function (component, snapInfo, coord, delta, scroll, origin) {
      var newCoord = getCoords(component, snapInfo, coord, delta);
      var snap = findSnap(component, snapInfo, newCoord, scroll, origin);

      var fixedCoord = DragCoord.asFixed(newCoord, scroll, origin);
      Presnaps.set(component, snapInfo, fixedCoord);
     
      return snap.fold(function () {
        return {
          coord: DragCoord.fixed(fixedCoord.left(), fixedCoord.top()),
          snapped: false
        };
        // No snap.
        // var newfixed = graph.boundToFixed(theatre, element, loc.left(), loc.top(), fixed.left(), fixed.top(), height);
        // presnaps.set(element, 'fixed', newfixed.left(), newfixed.top());
        // return { position: 'fixed', left: newfixed.left() + 'px', top: newfixed.top() + 'px' };
      }, function (spanned) {
        return {
          coord: spanned,
          snapped: true
        };
      });
    };

    var stopDrag = function (component, snapInfo) {
      Presnaps.clear(component, snapInfo);
    };

    // x: the absolute position.left of the draggable element
    // y: the absolute position.top of the draggable element
    // deltaX: the amount the mouse has moved horizontally
    // deltaY: the amount the mouse has moved vertically
    var findSnap = function (component, snapInfo, newCoord, scroll, origin) {
      // You need to pass in the absX and absY so that they can be used for things which only care about snapping one axis and keeping the other one.
      var snaps = snapInfo.getSnapPoints()(component);

      // HERE
      return Options.findMap(snaps, function (snap) {
        var sensor = snap.sensor();
        var inRange = DragCoord.withinRange(newCoord, sensor, snap.range().left(), snap.range().top(), scroll, origin);
        return inRange ? Option.some(
          DragCoord.absorb(snap.output(), newCoord, scroll, origin)
        ) : Option.none();
      });
    };

    /*
     Steps: 
       1. calculate the absolute position of the element based on either its presnap position or its current position. Presnap is fixed so it needs to be converted.
       2. get the scroll and size of the stage (we can ignore) to find the snapping container. The winning snapping container will have position, x, and y. It will 
       have sensor values, and then snapping values. Sensors will be used to determine if the snap has been activated, and snapping values will say where to put it.
       3. regardless of whether or not we have found a suitable snapping location, store the presnap position as 'fixed' (probably for Transitions because it uses it also),
       as the result of graph.boundToFixed(theatre, element, loc.left(), loc.top(), fixed.left(), fixed.top(), height); We need to use fixed anyway unless the snapping is absolute,
       so it's not any more complicated. However, if snapping, we also need to use absolute positions for absolute position things.



    */

    return {
      moveOrSnap: moveOrSnap,
      stopDrag: stopDrag
    };
  }
);