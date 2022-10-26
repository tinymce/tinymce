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

const isPartiallyVisible = (box: Boxes.Bounds, viewport: DockingViewport): boolean => {
  if (viewport.type === 'simple-docking-viewport') {
    return box.y < viewport.bounds.bottom && box.bottom > viewport.bounds.y;
  } else {
    return box.y < viewport.combinedBounds.bottom && box.bottom > viewport.combinedBounds.y;
  }
};

const isTopCompletelyVisible = (box: Boxes.Bounds, viewport: DockingViewport): boolean => {
  if (viewport.type === 'simple-docking-viewport') {
    return box.y >= viewport.bounds.y;
  } else {
    return box.y >= viewport.combinedBounds.y;
  }
};

const isBottomCompletelyVisible = (box: Boxes.Bounds, viewport: DockingViewport): boolean => {
  if (viewport.type === 'simple-docking-viewport') {
    return box.bottom <= viewport.bounds.bottom;
  } else {
    return box.bottom <= viewport.combinedBounds.bottom;
  }
};

const isVisibleForModes = (modes: DockingMode[], box: Boxes.Bounds, viewport: DockingViewport): boolean =>
  Arr.forall(modes, (mode) => {
    switch (mode) {
      case 'bottom':
        return isBottomCompletelyVisible(box, viewport);
      case 'top':
        return isTopCompletelyVisible(box, viewport);
    }
  });

const getPrior = (elem: SugarElement<HTMLElement>, state: DockingState): Optional<Boxes.Bounds> =>
  state.getInitialPos().map(
    // Only supports position absolute.
    (pos) => Boxes.bounds(
      pos.bounds.x,
      pos.bounds.y,
      Width.get(elem),
      Height.get(elem)
    )
  );

const storePrior = (elem: SugarElement<HTMLElement>, box: Boxes.Bounds, state: DockingState): void => {
  state.setInitialPos({
    style: Css.getAllRaw(elem),
    position: Css.get(elem, 'position') || 'static',
    bounds: box
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

const morphToOriginal = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> =>
  getPrior(elem, state)
    .filter((box) => isVisibleForModes(state.getModes(), box, viewport))
    .bind((box) => revertToOriginal(elem, box, state));

const morphToFixed = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  console.log('looking at this');
  const box = Boxes.box(elem);
  if (!isVisibleForModes(state.getModes(), box, viewport)) {
    storePrior(elem, box, state);
    console.log('would be docking');

    if (viewport.type === 'simple-docking-viewport') {
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
      // Calculate the fixed position
      const winBox = Boxes.win();
      const left = box.x - winBox.x;
      const top = viewport.combinedBounds.y - winBox.y;
      const bottom = winBox.bottom - viewport.combinedBounds.bottom;

      // Check whether we are docking the bottom of the viewport, or the top
      const isTop = box.y <= viewport.combinedBounds.y;
      return Optional.some(morphAdt.fixed(NuPositionCss(
        'fixed',
        Optional.some(left),
        isTop ? Optional.some(top) : Optional.none(),
        Optional.none(),
        !isTop ? Optional.some(bottom) : Optional.none()
      )));
    }
  } else {
    return Optional.none<MorphAdt>();
  }
};

const getMorph = (component: AlloyComponent, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  const elem = component.element;
  const isDocked = Optionals.is(Css.getRaw(elem, 'position'), 'fixed');
  return isDocked ? morphToOriginal(elem, viewport, state) : morphToFixed(elem, viewport, state);
};

const getMorphToOriginal = (component: AlloyComponent, state: DockingState): Optional<MorphAdt> => {
  const elem = component.element;
  return getPrior(elem, state).bind((box) => revertToOriginal(elem, box, state));
};

export {
  appear,
  disappear,
  isPartiallyVisible,
  getMorph,
  getMorphToOriginal
};
