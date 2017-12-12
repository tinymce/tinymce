import OffsetOrigin from '../../alien/OffsetOrigin';
import DragCoord from '../../api/data/DragCoord';
import Snappables from '../snap/Snappables';
import { Css } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import { Location } from '@ephox/sugar';
import { Scroll } from '@ephox/sugar';

var getCurrentCoord = function (target) {
  return Css.getRaw(target, 'left').bind(function (left) {
    return Css.getRaw(target, 'top').bind(function (top) {
      return Css.getRaw(target, 'position').map(function (position) {
        var nu = position === 'fixed' ? DragCoord.fixed : DragCoord.offset;
        return nu(
          parseInt(left, 10),
          parseInt(top, 10)
        );
      });
    });
  }).getOrThunk(function () {
    var location = Location.absolute(target);
    return DragCoord.absolute(location.left(), location.top());
  });
};

var calcNewCoord = function (component, optSnaps, currentCoord, scroll, origin, delta) {
  return optSnaps.fold(function () {
    // When not docking, use fixed coordinates.
    var translated = DragCoord.translate(currentCoord, delta.left(), delta.top());
    var fixedCoord = DragCoord.asFixed(translated, scroll, origin);
    return DragCoord.fixed(fixedCoord.left(), fixedCoord.top());
  }, function (snapInfo) {
    var snapping = Snappables.moveOrSnap(component, snapInfo, currentCoord, delta, scroll, origin);
    snapping.extra.each(function (extra) {
      snapInfo.onSensor()(component, extra);
    });
    return snapping.coord;
  });
};

var dragBy = function (component, dragConfig, delta) {
  var doc = Traverse.owner(component.element());
  var scroll = Scroll.get(doc);

  var target = dragConfig.getTarget()(component.element());
  var origin = OffsetOrigin.getOrigin(target, scroll);

  var currentCoord = getCurrentCoord(target);

  var newCoord = calcNewCoord(component, dragConfig.snaps(), currentCoord, scroll, origin, delta);
  var styles = DragCoord.toStyles(newCoord, scroll, origin);
  Css.setAll(target, styles);
};

export default <any> {
  dragBy: dragBy
};