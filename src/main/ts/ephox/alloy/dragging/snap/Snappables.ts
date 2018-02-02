import DragCoord from '../../api/data/DragCoord';
import Presnaps from './Presnaps';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Options } from '@ephox/katamari';

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
      extra: Option.none()
    };
    // No snap.
    // var newfixed = graph.boundToFixed(theatre, element, loc.left(), loc.top(), fixed.left(), fixed.top(), height);
    // presnaps.set(element, 'fixed', newfixed.left(), newfixed.top());
    // return { position: 'fixed', left: newfixed.left() + 'px', top: newfixed.top() + 'px' };
  }, function (spanned) {
    return {
      coord: spanned.output(),
      extra: spanned.extra()
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
  return Options.findMap(snaps, function (snap: any) {
    var sensor = snap.sensor();
    var inRange = DragCoord.withinRange(newCoord, sensor, snap.range().left(), snap.range().top(), scroll, origin);
    return inRange ? Option.some(
      {
        output: Fun.constant(DragCoord.absorb(snap.output(), newCoord, scroll, origin)),
        extra: snap.extra
      }
    ) : Option.none();
  });
};

export default <any> {
  moveOrSnap: moveOrSnap,
  stopDrag: stopDrag
};