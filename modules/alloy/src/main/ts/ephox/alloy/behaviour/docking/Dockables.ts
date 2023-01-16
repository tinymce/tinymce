import { Arr, Fun, Obj, Optional, Optionals } from '@ephox/katamari';
import { Class, Css, Height, SugarBody, SugarElement, SugarPosition, Width } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as OffsetOrigin from '../../alien/OffsetOrigin';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { NuPositionCss, PositionCss } from '../../positioning/view/PositionCss';
import { DockingContext, DockingDecision, DockingMode, DockingState, DockingViewport, DockToBottomDecision, DockToTopDecision, InitialDockingPosition } from './DockingTypes';

export interface StaticMorph {
  morph: 'static';
}

export interface AbsoluteMorph {
  morph: 'absolute';
  positionCss: PositionCss;
}

export interface FixedMorph {
  morph: 'fixed';
  positionCss: PositionCss;
}

export type MorphInfo = StaticMorph | AbsoluteMorph | FixedMorph;

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

const getXYForRestoring = (pos: InitialDockingPosition, viewport: DockingViewport): SugarPosition => {
  const priorY = viewport.optScrollEnv.fold(
    Fun.constant(pos.bounds.y),
    (scrollEnv) => scrollEnv.scrollElmTop + (pos.bounds.y - scrollEnv.currentScrollTop)
  );

  return SugarPosition(pos.bounds.x, priorY);
};

const getXYForSaving = (box: Boxes.Bounds, viewport: DockingViewport): SugarPosition => {
  const priorY = viewport.optScrollEnv.fold(
    Fun.constant(box.y),
    (scrollEnv) => box.y + scrollEnv.currentScrollTop - scrollEnv.scrollElmTop
  );

  return SugarPosition(box.x, priorY);
};

const getPrior = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<{ box: Boxes.Bounds; location: 'top' | 'bottom' }> =>
  state.getInitialPos().map(
    (pos) => {
      const xy = getXYForRestoring(pos, viewport);
      return {
        box: Boxes.bounds(xy.left, xy.top, Width.get(elem), Height.get(elem)),
        location: pos.location
      };
    }
  );

const storePrior = (
  elem: SugarElement<HTMLElement>,
  box: Boxes.Bounds,
  viewport: DockingViewport,
  state: DockingState,
  decision: DockToTopDecision | DockToBottomDecision
): void => {
  const xy = getXYForSaving(box, viewport);
  const bounds = Boxes.bounds(
    xy.left,
    xy.top,
    box.width,
    box.height
  );

  state.setInitialPos({
    style: Css.getAllRaw(elem),
    position: Css.get(elem, 'position') || 'static',
    bounds,
    location: decision.location
  });
};

// When we are using APIs like forceDockToTop, then we only want to store the previous position
// if we weren't already docked. Otherwise, we still want to move the component, but keep its old
// restore values
const storePriorIfNone = (
  elem: SugarElement<HTMLElement>,
  box: Boxes.Bounds,
  viewport: DockingViewport,
  state: DockingState,
  decision: DockToTopDecision | DockToBottomDecision
): void => {
  state.getInitialPos().fold(
    () => storePrior(elem, box, viewport, state, decision),
    () => Fun.noop
  );
};

const revertToOriginal = (elem: SugarElement<HTMLElement>, box: Boxes.Bounds, state: DockingState): Optional<StaticMorph | AbsoluteMorph> =>
  state.getInitialPos().bind((position) => {
    state.clearInitialPos();

    switch (position.position) {
      case 'static':
        return Optional.some({
          morph: 'static'
        });

      case 'absolute':
        const offsetParent = OffsetOrigin.getOffsetParent(elem).getOr(SugarBody.body());
        const offsetBox = Boxes.box(offsetParent);
        // Adding the scrollDelta here may not be the right solution. The basic problem is that the
        // rest of the code isn't considering whether its absolute or not, and where the offset parent
        // is. In the situation where the offset parent is *inside* the scrolling environment, then
        // we don't need to consider the scroll, and that's what getXYForRestoring does ... it removes
        // the scroll. We don't need to consider the scroll because the sink is already affected by the
        // scroll. However, when the sink IS the scroller, its position is not moved by scrolling. But the
        // positions of everything inside it needs to consider the scroll. So we add the scroll value.
        //
        // This might also be a bit naive. It's possible that we need to check that the offsetParent
        // is THE scroller, not just that it has a scroll value. For example, if the offset parent
        // was the body, and the body had a scroll, this might give unexpected results. That's somewhat
        // countered by the fact that if the offset parent is outside the scroller, then you don't really
        // have a scrolling environment any more, because the offset parent isn't going to be impacted
        // at all by the scroller
        const scrollDelta = offsetParent.dom.scrollTop ?? 0;
        return Optional.some({
          morph: 'absolute',
          positionCss: NuPositionCss(
            'absolute',
            Obj.get(position.style, 'left').map((_left) => box.x - offsetBox.x),
            Obj.get(position.style, 'top').map((_top) => box.y - offsetBox.y + scrollDelta),
            Obj.get(position.style, 'right').map((_right) => offsetBox.right - box.right),
            Obj.get(position.style, 'bottom').map((_bottom) => offsetBox.bottom - box.bottom)
          )
        });

      default:
        return Optional.none<StaticMorph | AbsoluteMorph>();
    }
  });

const tryMorphToOriginal = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<MorphInfo> =>
  getPrior(elem, viewport, state)
    .filter(({ box }) => isVisibleForModes(state.getModes(), box, viewport))
    .bind(({ box }) => revertToOriginal(elem, box, state));

const tryDecisionToFixedMorph = (decision: DockingDecision): Optional<FixedMorph> => {
  switch (decision.location) {
    case 'top': {
      // We store our current position so we can revert to it once it's
      // visible again.
      return Optional.some({
        morph: 'fixed',
        positionCss: NuPositionCss(
          'fixed',
          Optional.some(decision.leftX),
          Optional.some(decision.topY),
          Optional.none(),
          Optional.none()
        )
      });
    }

    case 'bottom': {
      // We store our current position so we can revert to it once it's
      // visible again.
      return Optional.some({
        morph: 'fixed',
        positionCss: NuPositionCss(
          'fixed',
          Optional.some(decision.leftX),
          Optional.none(),
          Optional.none(),
          Optional.some(decision.bottomY)
        )
      });
    }

    default:
      return Optional.none();
  }
};

const tryMorphToFixed = (elem: SugarElement<HTMLElement>, viewport: DockingViewport, state: DockingState): Optional<FixedMorph> => {
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
    // We are moving from undocked to docked, so store the previous location
    // so that we can restore it when we switch out of docking (back to undocked)
    storePrior(elem, box, viewport, state, decision);
    return tryDecisionToFixedMorph(decision);
  } else {
    return Optional.none();
  }
};

const tryMorphToOriginalOrUpdateFixed = (
  elem: SugarElement<HTMLElement>,
  viewport: DockingViewport,
  state: DockingState
): Optional<MorphInfo> => {
  // When a "docked" element is docked to the top of a scroll container (due to optScrollEnv in
  // viewport), we need to reposition its fixed if the scroll container has itself moved its top position.
  // This isn't required when the docking is to the top of the window, because the entire window cannot
  // be scrolled up and down the page - it is the page.
  //
  // Imagine a situation where the toolbar has docked to the top of the scroll container, which is at
  // y = 200. Now, when the user scrolls the page another 50px down the page, the top of the scroll
  // container will now be 150px, but the "fixed" toolbar will still be at "200px". So this is a morph
  // from "fixed" to "fixed", but with new coordinates. So if we can't morph to original from "fixed",
  // we try to update our "fixed" position (if we have a scrolling environment in the viewport)
  return tryMorphToOriginal(elem, viewport, state)
    .orThunk(() => {
      // Importantly, we don't update our stored position for the element before "docking", because
      // this is a transition between "docked" and "docked", not "undocked" and "docked". We want to
      // keep our undocked position in our store, not a docked position.
      // So we don't change our stored position. We just improve our fixed.
      return viewport.optScrollEnv
        .bind((_) => getPrior(elem, viewport, state))
        .bind(
          ({ box, location }) => {
            const winBox = Boxes.win();
            const leftX = getDockedLeftPosition({ win: winBox, box });
            // Keep the same docking location
            const decision = location === 'top'
              ? forceTopPosition(winBox, leftX, viewport)
              : forceBottomPosition(winBox, leftX, viewport);
            return tryDecisionToFixedMorph(decision);
          }
        );
    });
};

const tryMorph = (component: AlloyComponent, viewport: DockingViewport, state: DockingState): Optional<MorphInfo> => {
  const elem = component.element;
  const isDocked = Optionals.is(Css.getRaw(elem, 'position'), 'fixed');
  return isDocked
    ? tryMorphToOriginalOrUpdateFixed(elem, viewport, state)
    : tryMorphToFixed(elem, viewport, state);
};

// The difference between the "calculate" functions and the "try" functions is that the "try" functions
// will first consider whether there is a need to morph, whereas the "calculate" functions will just
// give you the morph details, bypassing the check to see if it's needed
const calculateMorphToOriginal = (component: AlloyComponent, viewport: DockingViewport, state: DockingState): Optional<StaticMorph | AbsoluteMorph> => {
  const elem = component.element;
  return getPrior(elem, viewport, state)
    .bind(({ box }) => revertToOriginal(elem, box, state));
};

const forceDockWith = (
  elem: SugarElement<HTMLElement>,
  viewport: DockingViewport,
  state: DockingState,
  getDecision: (winBox: Boxes.Bounds, leftX: number, v: DockingViewport) => DockingDecision
): Optional<FixedMorph> => {
  const box = Boxes.box(elem);
  const winBox = Boxes.win();
  const leftX = getDockedLeftPosition({ win: winBox, box });
  const decision = getDecision(winBox, leftX, viewport);
  if (decision.location === 'bottom' || decision.location === 'top') {
    // We only want to store the values if we aren't already docking. If we are already docking, then
    // we just want to move the element, without updating where it started originally
    storePriorIfNone(elem, box, viewport, state, decision);
    return tryDecisionToFixedMorph(decision);
  } else {
    return Optional.none();
  }
};

export {
  appear,
  disappear,
  isPartiallyVisible,
  tryMorph,
  calculateMorphToOriginal,
  forceDockWith,
  forceTopPosition,
  forceBottomPosition
};
