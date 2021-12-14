import { Fun, Num, Optional, Optionals } from '@ephox/katamari';
import { Css, Scroll, SugarElement, SugarLocation, SugarPosition, Traverse } from '@ephox/sugar';

import * as OffsetOrigin from '../../alien/OffsetOrigin';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as DragCoord from '../../api/data/DragCoord';
import * as Snappables from '../snap/Snappables';
import { DraggingConfig, DragStartData, SnapsConfig } from './DraggingTypes';

const getCurrentCoord = (target: SugarElement<HTMLElement>): DragCoord.CoordAdt =>
  Optionals.lift3(Css.getRaw(target, 'left'), Css.getRaw(target, 'top'), Css.getRaw(target, 'position'), (left, top, position) => {
    const nu = position === 'fixed' ? DragCoord.fixed : DragCoord.offset;
    return nu(
      parseInt(left, 10),
      parseInt(top, 10)
    );
  }).getOrThunk(() => {
    const location = SugarLocation.absolute(target);
    return DragCoord.absolute(location.left, location.top);
  });

const clampCoords = (component: AlloyComponent, coords: DragCoord.CoordAdt, scroll: SugarPosition, origin: SugarPosition, startData: DragStartData): DragCoord.CoordAdt => {
  const bounds = startData.bounds;
  const absoluteCoord = DragCoord.asAbsolute(coords, scroll, origin);

  const newX = Num.clamp(absoluteCoord.left, bounds.x, bounds.x + bounds.width - startData.width);
  const newY = Num.clamp(absoluteCoord.top, bounds.y, bounds.y + bounds.height - startData.height);
  const newCoords = DragCoord.absolute(newX, newY);

  // Translate the absolute coord back into the previous type
  return coords.fold(
    // offset
    () => {
      const offset = DragCoord.asOffset(newCoords, scroll, origin);
      return DragCoord.offset(offset.left, offset.top);
    },
    // absolute
    Fun.constant(newCoords),
    // fixed
    () => {
      const fixed = DragCoord.asFixed(newCoords, scroll, origin);
      return DragCoord.fixed(fixed.left, fixed.top);
    }
  );
};

const calcNewCoord = <E>(component: AlloyComponent, optSnaps: Optional<SnapsConfig<E>>, currentCoord: DragCoord.CoordAdt, scroll: SugarPosition, origin: SugarPosition, delta: SugarPosition, startData: DragStartData): DragCoord.CoordAdt => {
  const newCoord = optSnaps.fold(() => {
    // When not docking, use fixed coordinates.
    const translated = DragCoord.translate(currentCoord, delta.left, delta.top);
    const fixedCoord = DragCoord.asFixed(translated, scroll, origin);
    return DragCoord.fixed(fixedCoord.left, fixedCoord.top);
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

const dragBy = <E>(component: AlloyComponent, dragConfig: DraggingConfig<E>, startData: DragStartData, delta: SugarPosition): void => {
  const target = dragConfig.getTarget(component.element);

  if (dragConfig.repositionTarget) {
    const doc = Traverse.owner(component.element);
    const scroll = Scroll.get(doc);

    const origin = OffsetOrigin.getOrigin(target);

    const currentCoord = getCurrentCoord(target);

    const newCoord = calcNewCoord(component, dragConfig.snaps, currentCoord, scroll, origin, delta, startData);

    const styles = DragCoord.toStyles(newCoord, scroll, origin);
    Css.setOptions(target, styles);
  }
  // NOTE: On drag just goes with the original delta. It does not know about snapping.
  dragConfig.onDrag(component, target, delta);
};

export {
  dragBy
};
