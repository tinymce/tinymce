import { Adt, Arr, Obj, Optional, Optionals } from '@ephox/katamari';
import { Class, Css, Height, SugarBody, SugarElement, Width } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as OffsetOrigin from '../../alien/OffsetOrigin';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { NuPositionCss, PositionCss } from '../../positioning/view/PositionCss';
import { DockingContext, DockingMode, DockingState, DockingViewport } from './DockingTypes';

type StaticMorph<T> = () => T;
type AbsoluteMorph<T> = (pos: PositionCss) => T;
type FixedMorph<T> = (pos: PositionCss) => T;

export interface MorphAdt {
  fold: <T> (
    statics: StaticMorph<T>,
    absolute: AbsoluteMorph<T>,
    fixed: FixedMorph<T>
  ) => T;
  match: <T> (branches: {
    static: StaticMorph<T>;
    absolute: AbsoluteMorph<T>;
    fixed: FixedMorph<T>;
  }) => T;
  log: (label: string) => void;
}

interface MorphConstructor {
  static: StaticMorph<MorphAdt>;
  absolute: AbsoluteMorph<MorphAdt>;
  fixed: FixedMorph<MorphAdt>;
}

const morphAdt: MorphConstructor = Adt.generate([
  { static: [ ] },
  { absolute: [ 'positionCss' ] },
  { fixed: [ 'positionCss' ] }
]);

const appear = (component: AlloyComponent, contextualInfo: DockingContext): void => {
  const elem = component.element;
  Class.add(elem, contextualInfo.transitionClass);
  Class.remove(elem, contextualInfo.fadeOutClass);
  Class.add(elem, contextualInfo.fadeInClass);
  contextualInfo.onShow(component);
};

const disappear = (component: AlloyComponent, contextualInfo: DockingContext): void => {
  const elem = component.element;
  Class.add(elem, contextualInfo.transitionClass);
  Class.remove(elem, contextualInfo.fadeInClass);
  Class.add(elem, contextualInfo.fadeOutClass);
  contextualInfo.onHide(component);
};

const isPartiallyVisible = (box: Boxes.Bounds, bounds: Boxes.Bounds): boolean =>
  box.y < bounds.bottom && box.bottom > bounds.y;

const isTopCompletelyVisible = (box: Boxes.Bounds, bounds: Boxes.Bounds): boolean =>
  box.y >= bounds.y;

const isBottomCompletelyVisible = (box: Boxes.Bounds, bounds: Boxes.Bounds): boolean =>
  box.bottom <= bounds.bottom;

const isVisibleForModes = (modes: DockingMode[], box: Boxes.Bounds, viewport: DockingViewport): boolean =>
  Arr.forall(modes, (mode) => {
    switch (mode) {
      case 'bottom':
        return isBottomCompletelyVisible(box, viewport.bounds);
      case 'top':
        return isTopCompletelyVisible(box, viewport.bounds);
    }
  });

const getPrior = (elem: SugarElement<HTMLElement>, _viewport: DockingViewport, state: DockingState): Optional<Boxes.Bounds> =>
  state.getInitialPos().map(
    // Only supports position absolute.
    (pos) => {
      // TINY-9242: Consider the scrolling viewport here when calculating priorY.
      const priorY = pos.bounds.y;
      return Boxes.bounds(
        pos.bounds.x,
        priorY,
        Width.get(elem),
        Height.get(elem)
      );
    }
  );

const storePrior = (elem: SugarElement<HTMLElement>, box: Boxes.Bounds, _viewport: DockingViewport, state: DockingState): void => {
  // TINY-9242: Consider the scrolling viewport here when calculating bounds.
  const bounds = box;
  state.setInitialPos({
    style: Css.getAllRaw(elem),
    position: Css.get(elem, 'position') || 'static',
    bounds
  });
};

const revertToOriginal = (elem: SugarElement<HTMLElement>, box: Boxes.Bounds, state: DockingState): Optional<MorphAdt> =>
  state.getInitialPos().bind((position) => {
    state.clearInitialPos();

    switch (position.position) {
      case 'static':
        return Optional.some(morphAdt.static());

      case 'absolute':
        const offsetBox = OffsetOrigin.getOffsetParent(elem).map(Boxes.box)
          .getOrThunk(() => Boxes.box(SugarBody.body()));
        return Optional.some(morphAdt.absolute(NuPositionCss(
          'absolute',
          Obj.get(position.style, 'left').map((_left) => box.x - offsetBox.x),
          Obj.get(position.style, 'top').map((_top) => box.y - offsetBox.y),
          Obj.get(position.style, 'right').map((_right) => offsetBox.right - box.right),
          Obj.get(position.style, 'bottom').map((_bottom) => offsetBox.bottom - box.bottom)
        )));

      default:
        return Optional.none<MorphAdt>();
    }
  });

const tryMorphToOriginal = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> =>
  getPrior(elem, viewport, state)
    .filter((box) => isVisibleForModes(state.getModes(), box, viewport))
    .bind((box) => revertToOriginal(elem, box, state));

const tryMorphToFixed = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  const box = Boxes.box(elem);
  if (!isVisibleForModes(state.getModes(), box, viewport)) {
    storePrior(elem, box, viewport, state);

    // Calculate the fixed position
    const winBox = Boxes.win();
    const left = box.x - winBox.x;
    const top = viewport.bounds.y - winBox.y;
    const bottom = winBox.bottom - viewport.bounds.bottom;

    // Check whether we are docking the bottom of the viewport, or the top
    const isTop = box.y <= viewport.bounds.y;
    return Optional.some(morphAdt.fixed(NuPositionCss(
      'fixed',
      Optional.some(left),
      isTop ? Optional.some(top) : Optional.none(),
      Optional.none(),
      !isTop ? Optional.some(bottom) : Optional.none()
    )));
  } else {
    return Optional.none<MorphAdt>();
  }
};

const getMorph = (component: AlloyComponent, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  const elem = component.element;
  const isDocked = Optionals.is(Css.getRaw(elem, 'position'), 'fixed');
  return isDocked ? tryMorphToOriginal(elem, viewport, state) : tryMorphToFixed(elem, viewport, state);
};

const getMorphToOriginal = (component: AlloyComponent, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  const elem = component.element;
  return getPrior(elem, viewport, state)
    .bind((box) => revertToOriginal(elem, box, state));
};

export {
  appear,
  disappear,
  isPartiallyVisible,
  getMorph,
  getMorphToOriginal
};
