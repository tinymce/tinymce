define(
  'ephox.alloy.dragging.Dockables',

  [
    'ephox.alloy.dragging.CoordResolver',
    'ephox.alloy.dragging.DragCoord',
    'ephox.alloy.dragging.Presnaps',
    'ephox.compass.Arr',
    'ephox.ego.util.Graph',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Scroll',
    'ephox.sugar.api.Traverse',
    'global!Math'
  ],

  function (CoordResolver, DragCoord, Presnaps, Arr, Graph, Option, Scroll, Traverse, Math) {
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
    // position will go away. It is used to avoid the situation where you can't escape the dock unless you
    // move the mouse really quickly :)
    var getCoords = function (component, dockInfo, coord, deltaX, deltaY) {
      return Presnaps.get(component, dockInfo).fold(function () {
        return coord;
      }, function (fixed) {
        // We have a pre-snap position, so we have to apply the delta ourselves
        return DragCoord.fixed(fixed.left() + deltaX, fixed.top() + deltaY);
      });
    };

    var snap = function (component, dockInfo, resolver, absLeft, absTop, deltaX, deltaY) {
      var coord = DragCoord.absolute(absLeft, absTop);
      var newCoord = getCoords(component, dockInfo, coord, deltaX, deltaY);


    };

    var attemptSnap = function (component, dockInfo, absLeft, absTop, deltaX, deltaY) {
      var doc = Traverse.owner(component.element());

      var scroll = Scroll.get(doc);
      var origin = dockInfo.lazyOrigin()();
      
      return snap(component, dockInfo, resolver, absLeft, absTop, deltaX, deltaY);
      // absLeft and absTop are ignored if the values are retrieved from pre-snaps;
      var coords = getCoords(component, dockInfo, absLeft, absTop, deltaX, deltaY);
      
      var dock = findDock(component, dockInfo, newAbs.left(), newAbs.top());
      return dock.fold(function () {
        // No dock.
        // var newfixed = graph.boundToFixed(theatre, element, loc.left(), loc.top(), fixed.left(), fixed.top(), height);
        // presnaps.set(element, 'fixed', newfixed.left(), newfixed.top());
        // return { position: 'fixed', left: newfixed.left() + 'px', top: newfixed.top() + 'px' };
      }, function (activeDock) {
        // A position to snap to nearby, so render it on that snap position, but record where it actually should be.
        // var newfixed = graph.boundToFixed(theatre, element, loc.left(), loc.top(), fixed.left(), fixed.top(), height);
        // presnaps.set(element, 'fixed', newfixed.left() + 'px', newfixed.top() + 'px');

        // var isAbsolute = pin.position() === 'absolute';
        // var xy = isAbsolute ? graph.locationToAbsolute(element, pin.x(), pin.y()) : Position(pin.x(), pin.y());
        // return { position: pin.position(), left: xy.left() + 'px', top: xy.top() + 'px' };
      });
    };

    var stopDrag = function (component) {
      Presnaps.clear(component.element());
    };

    // x: the absolute position.left of the draggable element
    // y: the absolute position.top of the draggable element
    // deltaX: the amount the mouse has moved horizontally
    // deltaY: the amount the mouse has moved vertically
    var findDock = function (component, dockInfo, newCoord) {
      var doc = Traverse.owner(component.element());
      var origin = dockInfo.lazyOrigin()();
      var scroll = Scroll.get(doc);

      var asAbsolute = DragCoord.asAbsolute(newCoord, scroll, origin);
      var asFixed = DragCoord.asFixed(newCoord, scroll, origin);

      // You need to pass in the absX and absY so that they can be used for things which only care about docking one axis and keeping the other one.
      var docks = dockInfo.getDocks()(component, asAbsolute, asFixed);

      // HERE
      var winner = Arr.find(docks, function (dock) {
        var sensor = dock.sensor();
        return Math.abs(newAbsLeft - sensor.x() < dockInfo.xSensitivity() && 
          Math.abs(newAbsTop - sensor.y()) < dockInfo.ySensitivity());
      });

      return Option.from(winner).map(function (dock) { return dock.output(); });
    };

    /*
     Steps: 
       1. calculate the absolute position of the element based on either its presnap position or its current position. Presnap is fixed so it needs to be converted.
       2. get the scroll and size of the stage (we can ignore) to find the docking container. The winning docking container will have position, x, and y. It will 
       have sensor values, and then docked values. Sensors will be used to determine if the dock has been activated, and docked values will say where to put it.
       3. regardless of whether or not we have found a suitable docking location, store the presnap position as 'fixed' (probably for Transitions because it uses it also),
       as the result of graph.boundToFixed(theatre, element, loc.left(), loc.top(), fixed.left(), fixed.top(), height); We need to use fixed anyway unless the dock is absolute,
       so it's not any more complicated. However, if docking, we also need to use absolute positions for absolute position things.



    */

    return {
      attemptSnap: attemptSnap,
      stopDrag: stopDrag
    };
  }
);