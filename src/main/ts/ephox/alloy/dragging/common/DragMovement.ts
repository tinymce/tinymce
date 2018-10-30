import { Css, Location, Scroll, Traverse, Element } from '@ephox/sugar';

import * as OffsetOrigin from '../../alien/OffsetOrigin';
import * as DragCoord from '../../api/data/DragCoord';
import * as Snappables from '../snap/Snappables';
import { SugarPosition } from '../../alien/TypeDefinitions';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { DraggingConfig, SnapsConfig } from '../../dragging/common/DraggingTypes';

const getCurrentCoord = (target: Element): DragCoord.CoordAdt => {
  return Css.getRaw(target, 'left').bind((left) => {
    return Css.getRaw(target, 'top').bind((top) => {
      return Css.getRaw(target, 'position').map((position) => {
        const nu = position === 'fixed' ? DragCoord.fixed : DragCoord.offset;
        return nu(
          parseInt(left, 10),
          parseInt(top, 10)
        );
      });
    });
  }).getOrThunk(() => {
    const location = Location.absolute(target);
    return DragCoord.absolute(location.left(), location.top());
  });
};

const calcNewCoord = (component: AlloyComponent, optSnaps: Option<SnapsConfig>, currentCoord: DragCoord.CoordAdt, scroll: SugarPosition, origin: SugarPosition, delta: SugarPosition): DragCoord.CoordAdt => {
  return optSnaps.fold(() => {
    // When not docking, use fixed coordinates.
    const translated = DragCoord.translate(currentCoord, delta.left(), delta.top());
    const fixedCoord = DragCoord.asFixed(translated, scroll, origin);
    return DragCoord.fixed(fixedCoord.left(), fixedCoord.top());
  }, (snapInfo) => {
    const snapping = Snappables.moveOrSnap(component, snapInfo, currentCoord, delta, scroll, origin);
    snapping.extra.each((extra) => {
      snapInfo.onSensor(component, extra);
    });
    return snapping.coord;
  });
};

const dragBy = (component: AlloyComponent, dragConfig: DraggingConfig, delta: SugarPosition): void => {
  const target = dragConfig.getTarget(component.element());

  if (dragConfig.repositionTarget) {
    const doc = Traverse.owner(component.element());
    const scroll = Scroll.get(doc);


    const origin = OffsetOrigin.getOrigin(target, scroll);

    const currentCoord = getCurrentCoord(target);

    const newCoord = calcNewCoord(component, dragConfig.snaps, currentCoord, scroll, origin, delta);
    const styles = DragCoord.toStyles(newCoord, scroll, origin);
    Css.setAll(target, styles);
  }
  // NOTE: On drag just goes with the original delta. It does not know about snapping.
  dragConfig.onDrag(component, target, delta);
};

export {
  dragBy
};