define(
  'ephox.alloy.dragging.Dockables',

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
    // position will go away. It is used to avoid the situation where you can't escape the dock unless you
    // move the mouse really quickly :)
    var getCoords = function (component, dockInfo, coord, delta) {
      return Presnaps.get(component, dockInfo).fold(function () {
        return coord;
      }, function (fixed) {
        // We have a pre-snap position, so we have to apply the delta ourselves
        return DragCoord.fixed(fixed.left() + delta.left(), fixed.top() + delta.top());
      });
    };

    var moveOrDock = function (component, dockInfo, coord, delta, scroll, origin) {
      var newCoord = getCoords(component, dockInfo, coord, delta);
      var dock = findDock(component, dockInfo, newCoord);

      var fixedCoord = DragCoord.asFixed(newCoord, scroll, origin);
      Presnaps.set(component, dockInfo, fixedCoord);
     
      return dock.fold(function () {
        return DragCoord.fixed(fixedCoord.left(), fixedCoord.top());
        // No dock.
        // var newfixed = graph.boundToFixed(theatre, element, loc.left(), loc.top(), fixed.left(), fixed.top(), height);
        // presnaps.set(element, 'fixed', newfixed.left(), newfixed.top());
        // return { position: 'fixed', left: newfixed.left() + 'px', top: newfixed.top() + 'px' };
      }, function (docked) {
        return docked;
      });
    };

    var stopDrag = function (component) {
      Presnaps.clear(component.element());
    };

    // x: the absolute position.left of the draggable element
    // y: the absolute position.top of the draggable element
    // deltaX: the amount the mouse has moved horizontally
    // deltaY: the amount the mouse has moved vertically
    var findDock = function (component, dockInfo, newCoord, scroll, origin) {
      // You need to pass in the absX and absY so that they can be used for things which only care about docking one axis and keeping the other one.
      var docks = dockInfo.getDocks()(component);

      // HERE
      return Options.findMap(docks, function (dock) {
        var sensor = dock.sensor();
        var inRange = DragCoord.withinRange(newCoord, sensor, dockInfo.xSensitivity(), dockInfo.ySensitivity(), origin, scroll);
        return inRange ? Option.some(dock.output()) : Option.none();
      });
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
      moveOrDock: moveOrDock,
      stopDrag: stopDrag
    };
  }
);