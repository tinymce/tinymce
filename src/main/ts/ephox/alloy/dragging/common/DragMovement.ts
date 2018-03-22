import { Css, Location, Scroll, Traverse } from '@ephox/sugar';

import * as OffsetOrigin from '../../alien/OffsetOrigin';
import * as DragCoord from '../../api/data/DragCoord';
import * as Snappables from '../snap/Snappables';

const getCurrentCoord = function (target) {
  return Css.getRaw(target, 'left').bind(function (left) {
    return Css.getRaw(target, 'top').bind(function (top) {
      return Css.getRaw(target, 'position').map(function (position) {
        const nu = position === 'fixed' ? DragCoord.fixed : DragCoord.offset;
        return nu(
          parseInt(left, 10),
          parseInt(top, 10)
        );
      });
    });
  }).getOrThunk(function () {
    const location = Location.absolute(target);
    return DragCoord.absolute(location.left(), location.top());
  });
};

const calcNewCoord = function (component, optSnaps, currentCoord, scroll, origin, delta) {
  return optSnaps.fold(function () {
    // When not docking, use fixed coordinates.
    const translated = DragCoord.translate(currentCoord, delta.left(), delta.top());
    const fixedCoord = DragCoord.asFixed(translated, scroll, origin);
    return DragCoord.fixed(fixedCoord.left(), fixedCoord.top());
  }, function (snapInfo) {
    const snapping = Snappables.moveOrSnap(component, snapInfo, currentCoord, delta, scroll, origin);
    snapping.extra.each(function (extra) {
      snapInfo.onSensor()(component, extra);
    });
    return snapping.coord;
  });
};

const dragBy = function (component, dragConfig, delta) {
  const doc = Traverse.owner(component.element());
  const scroll = Scroll.get(doc);

  const target = dragConfig.getTarget()(component.element());
  const origin = OffsetOrigin.getOrigin(target, scroll);

  const currentCoord = getCurrentCoord(target);

  const newCoord = calcNewCoord(component, dragConfig.snaps(), currentCoord, scroll, origin, delta);
  const styles = DragCoord.toStyles(newCoord, scroll, origin);
  Css.setAll(target, styles);
};

export {
  dragBy
};