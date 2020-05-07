import { HTMLElement } from '@ephox/dom-globals';
import { Adt, Arr, Obj, Option } from '@ephox/katamari';
import { Body, Class, Css, Element, Height, Width } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { DockingContext, DockingMode, DockingState, InitialDockingPosition } from './DockingTypes';
import * as OffsetOrigin from '../../alien/OffsetOrigin';
import { PositionCss, NuPositionCss } from '../../positioning/view/PositionCss';

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
  const elem = component.element();
  Class.add(elem, contextualInfo.transitionClass);
  Class.remove(elem, contextualInfo.fadeOutClass);
  Class.add(elem, contextualInfo.fadeInClass);
  contextualInfo.onShow(component);
};

const disappear = (component: AlloyComponent, contextualInfo: DockingContext): void => {
  const elem = component.element();
  Class.add(elem, contextualInfo.transitionClass);
  Class.remove(elem, contextualInfo.fadeInClass);
  Class.add(elem, contextualInfo.fadeOutClass);
  contextualInfo.onHide(component);
};

const isPartiallyVisible = (box: Boxes.Bounds, viewport: Boxes.Bounds): boolean =>
  box.y < viewport.bottom && box.bottom > viewport.y;

const isTopCompletelyVisible = (box: Boxes.Bounds, viewport: Boxes.Bounds): boolean =>
  box.y >= viewport.y;

const isBottomCompletelyVisible = (box: Boxes.Bounds, viewport: Boxes.Bounds): boolean =>
  box.bottom <= viewport.bottom;

const isVisibleForModes = (modes: DockingMode[], box: Boxes.Bounds, viewport: Boxes.Bounds): boolean =>
  Arr.forall(modes, (mode) => {
    switch (mode) {
      case 'bottom':
        return isBottomCompletelyVisible(box, viewport);
      case 'top':
        return isTopCompletelyVisible(box, viewport);
    }
  });

const getPrior = (elem: Element<HTMLElement>, state: DockingState): Option<Boxes.Bounds> =>
  state.getInitialPosition().map(
    // Only supports position absolute.
    (pos) => Boxes.bounds(
      pos.bounds.x,
      pos.bounds.y,
      Width.get(elem),
      Height.get(elem)
    )
  );

const storePrior = (elem: Element<HTMLElement>, box: Boxes.Bounds, state: DockingState): void => {
  state.setInitialPosition(Option.some<InitialDockingPosition>({
    style: Css.getAllRaw(elem),
    position: Css.get(elem, 'position') || 'static',
    bounds: box
  }));
};

const revertToOriginal = (elem: Element<HTMLElement>, box: Boxes.Bounds, state: DockingState): Option<MorphAdt> =>
  state.getInitialPosition().bind((position) => {
    state.setInitialPosition(Option.none());

    switch (position.position) {
      case 'static':
        return Option.some(morphAdt.static());

      case 'absolute':
        const offsetBox = OffsetOrigin.getOffsetParent(elem).map(Boxes.box).
          getOrThunk(() => Boxes.box(Body.body()));
        return Option.some(morphAdt.absolute(NuPositionCss(
          'absolute',
          Obj.get(position.style, 'left').map((_left) => box.x - offsetBox.x),
          Obj.get(position.style, 'top').map((_top) => box.y - offsetBox.y),
          Obj.get(position.style, 'right').map((_right) => offsetBox.right - box.right),
          Obj.get(position.style, 'bottom').map((_bottom) => offsetBox.bottom - box.bottom),
        )));

      default:
        return Option.none<MorphAdt>();
    }
  });

const morphToOriginal = (elem: Element<HTMLElement>, viewport: Boxes.Bounds, state: DockingState): Option<MorphAdt> =>
  getPrior(elem, state)
    .filter((box) => isVisibleForModes(state.getModes(), box, viewport))
    .bind((box) => revertToOriginal(elem, box, state));

const morphToFixed = (elem: Element<HTMLElement>, viewport: Boxes.Bounds, state: DockingState): Option<MorphAdt> => {
  const box = Boxes.box(elem);
  if (!isVisibleForModes(state.getModes(), box, viewport)) {
    storePrior(elem, box, state);

    // Calculate the fixed position
    const winBox = Boxes.win();
    const left = box.x - winBox.x;
    const top = viewport.y - winBox.y;
    const bottom = winBox.bottom - viewport.bottom;

    // Check whether we are docking the bottom of the viewport, or the top
    const isTop = box.y <= viewport.y;
    return Option.some(morphAdt.fixed(NuPositionCss(
      'fixed',
      Option.some(left),
      isTop ? Option.some(top) : Option.none(),
      Option.none(),
      !isTop ? Option.some(bottom) : Option.none()
    )));
  } else {
    return Option.none<MorphAdt>();
  }
};

const getMorph = (component: AlloyComponent, viewport: Boxes.Bounds, state: DockingState): Option<MorphAdt> => {
  const elem = component.element();
  const isDocked = Css.getRaw(elem, 'position').is('fixed');
  return isDocked ? morphToOriginal(elem, viewport, state) : morphToFixed(elem, viewport, state);
};

const getMorphToOriginal = (component: AlloyComponent, state: DockingState): Option<MorphAdt> => {
  const elem = component.element();
  return getPrior(elem, state).bind((box) => revertToOriginal(elem, box, state));
};

export {
  appear,
  disappear,
  isPartiallyVisible,
  getMorph,
  getMorphToOriginal
};
