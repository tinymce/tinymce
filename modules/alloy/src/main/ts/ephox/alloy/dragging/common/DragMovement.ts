import { Option } from '@ephox/katamari';
import { Css, Location, Scroll, Traverse, Element } from '@ephox/sugar';

import { cap } from '../../alien/Cycles';
import * as OffsetOrigin from '../../alien/OffsetOrigin';
import { SugarPosition } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as DragCoord from '../../api/data/DragCoord';
import * as Snappables from '../snap/Snappables';
import { DraggingConfig, DragStartData, SnapsConfig } from './DraggingTypes';

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

const clampCoords = (component: AlloyComponent, coords: DragCoord.CoordAdt, scroll: SugarPosition, origin: SugarPosition, startData: DragStartData): DragCoord.CoordAdt => {
  const bounds = startData.bounds;
  const absoluteCoord = DragCoord.asAbsolute(coords, scroll, origin);

  const newX = cap(absoluteCoord.left(), bounds.x(), bounds.width() - startData.width);
  const newY = cap(absoluteCoord.top(), bounds.y(), bounds.height() - startData.height);
  const newCoords = DragCoord.absolute(newX, newY);

  // Translate the absolute coord back into the previous type
  return coords.fold(
    // offset
    () => {
      const offset = DragCoord.asOffset(newCoords, scroll, origin);
      return DragCoord.offset(offset.left(), offset.top());
    },
    // absolute
    () => newCoords,
    // fixed
    () => {
      const fixed = DragCoord.asFixed(newCoords, scroll, origin);
      return DragCoord.fixed(fixed.left(), fixed.top());
    },
  );
};

const calcNewCoord = (component: AlloyComponent, optSnaps: Option<SnapsConfig>, currentCoord: DragCoord.CoordAdt, scroll: SugarPosition, origin: SugarPosition, delta: SugarPosition, startData: DragStartData): DragCoord.CoordAdt => {
  const newCoord = optSnaps.fold(() => {
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

  // Clamp the coords so that they are within the bounds
  return clampCoords(component, newCoord, scroll, origin, startData);
};

const dragBy = (component: AlloyComponent, dragConfig: DraggingConfig, startData: DragStartData, delta: SugarPosition): void => {
  const target = dragConfig.getTarget(component.element());

  if (dragConfig.repositionTarget) {
    const doc = Traverse.owner(component.element());
    const scroll = Scroll.get(doc);

    const origin = OffsetOrigin.getOrigin(target, scroll);

    const currentCoord = getCurrentCoord(target);

    const newCoord = calcNewCoord(component, dragConfig.snaps, currentCoord, scroll, origin, delta, startData);

    const styles = DragCoord.toStyles(newCoord, scroll, origin);
    Css.setAll(target, styles);
  }
  // NOTE: On drag just goes with the original delta. It does not know about snapping.
  dragConfig.onDrag(component, target, delta);
};

export {
  dragBy
};
