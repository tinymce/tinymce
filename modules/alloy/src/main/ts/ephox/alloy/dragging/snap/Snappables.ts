import { Arr, Optional } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as DragCoord from '../../api/data/DragCoord';
import { SnapConfig, SnapOutput, SnapPin, SnapsConfig } from '../common/DraggingTypes';

import * as Presnaps from './Presnaps';

// Types of coordinates
// SugarLocation: This is the position on the screen including scroll.
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
const getCoords = <E>(component: AlloyComponent, snapInfo: SnapsConfig<E>, coord: DragCoord.CoordAdt, delta: SugarPosition): DragCoord.CoordAdt => Presnaps.get(component, snapInfo).fold(() => coord, (fixed) =>
// We have a pre-snap position, so we have to apply the delta ourselves
  DragCoord.fixed(fixed.left + delta.left, fixed.top + delta.top)
);

const moveOrSnap = <E>(component: AlloyComponent, snapInfo: SnapsConfig<E>, coord: DragCoord.CoordAdt, delta: SugarPosition, scroll: SugarPosition, origin: SugarPosition): SnapPin<E> => {
  const newCoord = getCoords(component, snapInfo, coord, delta);
  const snap = snapInfo.mustSnap ? findClosestSnap(component, snapInfo, newCoord, scroll, origin) :
    findSnap(component, snapInfo, newCoord, scroll, origin);

  const fixedCoord = DragCoord.asFixed(newCoord, scroll, origin);
  Presnaps.set(component, snapInfo, fixedCoord);

  return snap.fold(() =>
    ({
      coord: DragCoord.fixed(fixedCoord.left, fixedCoord.top),
      extra: Optional.none()
    })
    // No snap.
    // var newfixed = graph.boundToFixed(theatre, element, loc.left, loc.top, fixed.left, fixed.top, height);
    // presnaps.set(element, 'fixed', newfixed.left, newfixed.top);
    // return { position: 'fixed', left: newfixed.left + 'px', top: newfixed.top + 'px' };
  , (spanned) => ({
    coord: spanned.output,
    extra: spanned.extra
  }));
};

const stopDrag = <E>(component: AlloyComponent, snapInfo: SnapsConfig<E>): void => {
  Presnaps.clear(component, snapInfo);
};

const findMatchingSnap = <E>(snaps: Array<SnapConfig<E>>, newCoord: DragCoord.CoordAdt, scroll: SugarPosition, origin: SugarPosition): Optional<SnapOutput<E>> => Arr.findMap(snaps, (snap) => {
  const sensor = snap.sensor;
  const inRange = DragCoord.withinRange(newCoord, sensor, snap.range.left, snap.range.top, scroll, origin);
  return inRange ? Optional.some(
    {
      output: DragCoord.absorb(snap.output, newCoord, scroll, origin),
      extra: snap.extra
    }
  ) : Optional.none();
});

interface SnapCandidate<E> {
  deltas: Optional<SugarPosition>;
  snap: Optional<SnapConfig<E>>;
}

const findClosestSnap = <E>(component: AlloyComponent, snapInfo: SnapsConfig<E>, newCoord: DragCoord.CoordAdt, scroll: SugarPosition, origin: SugarPosition): Optional<SnapOutput<E>> => {
  // You need to pass in the absX and absY so that they can be used for things which only care about snapping one axis and keeping the other one.
  const snaps = snapInfo.getSnapPoints(component);

  const matchSnap = findMatchingSnap(snaps, newCoord, scroll, origin);
  return matchSnap.orThunk((): Optional<SnapOutput<E>> => {
    const bestSnap = Arr.foldl(snaps, (acc: SnapCandidate<E>, snap: SnapConfig<E>): SnapCandidate<E> => {
      const sensor = snap.sensor;
      const deltas = DragCoord.getDeltas(newCoord, sensor, snap.range.left, snap.range.top, scroll, origin);
      return acc.deltas.fold(() => ({
        deltas: Optional.some(deltas),
        snap: Optional.some(snap)
      }), (bestDeltas) => {
        const currAvg = (deltas.left + deltas.top) / 2;
        const bestAvg = (bestDeltas.left + bestDeltas.top) / 2;
        if (currAvg <= bestAvg) {
          return {
            deltas: Optional.some(deltas),
            snap: Optional.some(snap)
          };
        } else {
          return acc;
        }
      });
    }, {
      deltas: Optional.none<SugarPosition>(),
      snap: Optional.none<SnapConfig<E>>()
    });
    return bestSnap.snap.map((snap): SnapOutput<E> => ({
      output: DragCoord.absorb(snap.output, newCoord, scroll, origin),
      extra: snap.extra
    }));
  });
};

// x: the absolute position.left of the draggable element
// y: the absolute position.top of the draggable element
// deltaX: the amount the mouse has moved horizontally
// deltaY: the amount the mouse has moved vertically
const findSnap = <E>(component: AlloyComponent, snapInfo: SnapsConfig<E>, newCoord: DragCoord.CoordAdt, scroll: SugarPosition, origin: SugarPosition): Optional<SnapOutput<E>> => {
  // You need to pass in the absX and absY so that they can be used for things which only care about snapping one axis and keeping the other one.
  const snaps = snapInfo.getSnapPoints(component);

  // HERE
  return findMatchingSnap(snaps, newCoord, scroll, origin);
};

const snapTo = <E>(snap: SnapConfig<E>, scroll: SugarPosition, origin: SugarPosition): SnapPin<E> => ({
  // TODO: This looks to be incorrect and needs fixing as DragCoord definitely needs a number
  // based drag coord for the second argument here, so this is probably a bug.
  coord: DragCoord.absorb(snap.output, snap.output as any, scroll, origin),
  extra: snap.extra
});

export {
  moveOrSnap,
  stopDrag,
  snapTo
};
