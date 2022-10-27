import { Adt, Arr, Fun, Obj, Optional, Optionals } from '@ephox/katamari';
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

const isVisibleForModes = (modes: DockingMode[], box: Boxes.Bounds, viewport: DockingViewport): boolean => {
  const isVisible = Arr.forall(modes, (mode) => {
    switch (mode) {
      case 'bottom':
        return isBottomCompletelyVisible(box, viewport.bounds);
      case 'top':
        return isTopCompletelyVisible(box, viewport.bounds);
    }
  });
  return isVisible;
};

const getPrior = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<Boxes.Bounds> =>
  state.getInitialPos().map(
    // Only supports position absolute.
    (pos) => {
      const priorY = viewport.optScrollEnv.fold(
        Fun.constant(pos.bounds.y),
        (scrollEnv) => scrollEnv.scrollElmTop + (pos.bounds.y - scrollEnv.currentScrollTop)
      );

      return Boxes.bounds(
        pos.bounds.x,
        priorY,
        Width.get(elem),
        Height.get(elem)
      );
    }
  );

const storePrior = (elem: SugarElement<HTMLElement>, box: Boxes.Bounds, viewport: DockingViewport, state: DockingState): void => {
  const bounds = viewport.optScrollEnv.fold(
    Fun.constant(box),
    (scrollEnv) => {
      return Boxes.translate(
        box,
        0,
        scrollEnv.currentScrollTop - scrollEnv.scrollElmTop
      );
    }
  );

  state.setInitialPos({
    style: Css.getAllRaw(elem),
    position: Css.get(elem, 'position') || 'static',
    bounds,
    initialViewport: viewport
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

const tryMorphToOriginal = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  return getPrior(elem, viewport, state)
    .filter((box) => isVisibleForModes(state.getModes(), box, viewport))
    .bind((box) => revertToOriginal(elem, box, state));
};

const getFixedMorph = (boxX: number, boxY: number, viewportBounds: Boxes.Bounds): MorphAdt => {
  // Calculate the fixed position
  const winBox = Boxes.win();
  const left = boxX - winBox.x;
  const top = viewportBounds.y - winBox.y;
  const bottom = winBox.bottom - viewportBounds.bottom;

  // Check whether we are docking the bottom of the viewport, or the top
  const isTopDock = boxY <= viewportBounds.y;
  return morphAdt.fixed(
    NuPositionCss(
      'fixed',
      Optional.some(left),
      isTopDock ? Optional.some(top) : Optional.none(),
      Optional.none(),
      !isTopDock ? Optional.some(bottom) : Optional.none()
    )
  );
};

const tryMorphToFixedIfRequired = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  const box = Boxes.box(elem);
  if (!isVisibleForModes(state.getModes(), box, viewport)) {

    // So this store prior has to do fancy things.
    storePrior(elem, box, viewport, state);
    return Optional.some(
      getFixedMorph(box.x, box.y, viewport.bounds)
    );
  } else {
    return Optional.none<MorphAdt>();
  }
};

const tryMorphToUpdatedFixed = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  // Importantly, we don't change our position. We just improve our fixed.
  return getPrior(elem, viewport, state).map(
    (box) => getFixedMorph(box.x, box.y, viewport.bounds)
  );
};

const getMorph = (component: AlloyComponent, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  const elem = component.element;
  const isDocked = Optionals.is(Css.getRaw(elem, 'position'), 'fixed');
  return isDocked ? tryMorphToOriginal(elem, viewport, state).orThunk(() => {
    // Importantly, we don't change our stored position. We just improve our fixed.
    return tryMorphToUpdatedFixed(elem, viewport, state);
  }) : tryMorphToFixedIfRequired(elem, viewport, state);
};

const getMorphToOriginal = (component: AlloyComponent, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  const elem = component.element;
  return getPrior(elem, viewport, state).bind((box) => revertToOriginal(elem, box, state));
};

export {
  appear,
  disappear,
  isPartiallyVisible,
  getMorph,
  getMorphToOriginal
};
