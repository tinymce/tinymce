import { Adt, Arr, Obj, Optional, Optionals } from '@ephox/katamari';
import { Class, Css, Height, SugarBody, SugarElement, Width } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as OffsetOrigin from '../../alien/OffsetOrigin';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { NuPositionCss, PositionCss } from '../../positioning/view/PositionCss';
import { DockingContext, DockingDecision, DockingMode, DockingState, DockingViewport } from './DockingTypes';

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

// TODO: Stop this being an ADT
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

const forceTopPosition = (winBox: Boxes.Bounds, leftX: number, viewport: DockingViewport): DockingDecision => ({
  location: 'top',
  leftX,
  topY: viewport.bounds.y - winBox.y
});

const forceBottomPosition = (winBox: Boxes.Bounds, leftX: number, viewport: DockingViewport): DockingDecision => ({
  location: 'bottom',
  leftX,
  bottomY: winBox.bottom - viewport.bounds.bottom
});

const getDockedLeftPosition = (bounds: { win: Boxes.Bounds; box: Boxes.Bounds }): number => {
  // Essentially, we are just getting the bounding client rect left here,
  // because winBox.x will be the scroll value.
  return bounds.box.x - bounds.win.x;
};

const tryDockingPosition = (modes: DockingMode[], bounds: { win: Boxes.Bounds; box: Boxes.Bounds }, viewport: DockingViewport): DockingDecision => {
  const winBox = bounds.win;
  const box = bounds.box;

  const leftX = getDockedLeftPosition(bounds);
  return Arr.findMap(modes, (mode): Optional<DockingDecision> => {
    switch (mode) {
      case 'bottom':
        return !isBottomCompletelyVisible(box, viewport.bounds) ? Optional.some(
          forceBottomPosition(winBox, leftX, viewport)
        ) : Optional.none();
      case 'top':
        return !isTopCompletelyVisible(box, viewport.bounds) ? Optional.some(
          forceTopPosition(winBox, leftX, viewport)
        ) : Optional.none();

      default:
        return Optional.none();
    }
  }).getOr({
    location: 'no-dock'
  });
};

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

const tryDecisionToMorph = (decision: DockingDecision): Optional<MorphAdt> => {
  switch (decision.location) {
    case 'top': {
      // We store our current position so we can revert to it once it's
      // visible again.
      return Optional.some(
        morphAdt.fixed(
          NuPositionCss(
            'fixed',
            Optional.some(decision.leftX),
            Optional.some(decision.topY),
            Optional.none(),
            Optional.none()
          )
        )
      );
    }

    case 'bottom': {
      // We store our current position so we can revert to it once it's
      // visible again.
      return Optional.some(
        morphAdt.fixed(
          NuPositionCss(
            'fixed',
            Optional.some(decision.leftX),
            Optional.none(),
            Optional.none(),
            Optional.some(decision.bottomY)
          )
        )
      );
    }

    default:
      return Optional.none();
  }
};

const tryMorphToFixed = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<MorphAdt> => {
  const box = Boxes.box(elem);
  const winBox = Boxes.win();

  const decision = tryDockingPosition(
    state.getModes(),
    {
      win: winBox,
      box
    },
    viewport
  );

  if (decision.location === 'top' || decision.location === 'bottom') {
    // We are moving to undocked to docked, so store the previous location
    // so that we can restore it when we switch out of docking (back to undocked)
    storePrior(elem, box, viewport, state);
    return tryDecisionToMorph(decision);
  } else {
    return Optional.none();
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
