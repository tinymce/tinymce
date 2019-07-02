import { Option } from '@ephox/katamari';
import { Attr, Class, Css, Height, Location, Width, Element } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import { SugarPosition } from '../../alien/TypeDefinitions';
import * as DragCoord from '../../api/data/DragCoord';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { DockingContext, DockingConfig } from './DockingTypes';

const appear = (component: AlloyComponent, contextualInfo: DockingContext): void => {
  Class.add(component.element(), contextualInfo.transitionClass);
  Class.remove(component.element(), contextualInfo.fadeOutClass);
  Class.add(component.element(), contextualInfo.fadeInClass);
};

const disappear = (component: AlloyComponent, contextualInfo: DockingContext): void => {
  Class.add(component.element(), contextualInfo.transitionClass);
  Class.remove(component.element(), contextualInfo.fadeInClass);
  Class.add(component.element(), contextualInfo.fadeOutClass);
};

const isPartiallyVisible = (box: Boxes.Bounds, viewport: Boxes.Bounds): boolean => {
  return box.y() < viewport.bottom() && box.bottom() > viewport.y();
};

const isCompletelyVisible = (box: Boxes.Bounds, viewport: Boxes.Bounds): boolean => {
  return box.y() >= viewport.y() && box.bottom() <= viewport.bottom();
};

const getAttr = (elem: Element, attr: string): Option<number> => {
  return Attr.has(elem, attr) ? Option.some(
    parseInt(Attr.get(elem, attr), 10)
  ) : Option.none();
};

const getPrior = (component: AlloyComponent, dockInfo: DockingConfig): Option<Boxes.Bounds> => {
  const elem = component.element();
  return getAttr(elem, dockInfo.leftAttr).bind((left) => {
    return getAttr(elem, dockInfo.topAttr).map((top) => {
      // Only supports position absolute.
      const w = Width.get(component.element());
      const h = Height.get(component.element());
      return Boxes.bounds(left, top, w, h);
    });
  });
};

const setPrior = (component: AlloyComponent, dockInfo: DockingConfig, absLeft: string | number, absTop: string | number): void => {
  const elem = component.element();
  Attr.set(elem, dockInfo.leftAttr, absLeft);
  Attr.set(elem, dockInfo.topAttr, absTop);
};

const clearPrior = (component: AlloyComponent, dockInfo: DockingConfig): void => {
  const elem = component.element();
  Attr.remove(elem, dockInfo.leftAttr);
  Attr.remove(elem, dockInfo.topAttr);
};

const morphToAbsolute = (component: AlloyComponent, dockInfo: DockingConfig, viewport: Boxes.Bounds): Option<DragCoord.CoordAdt> => {
  return getPrior(component, dockInfo).bind((box) => {
    if (isCompletelyVisible(box, viewport)) {
      // Revert it back to absolute
      clearPrior(component, dockInfo);
      return Option.some(
        DragCoord.absolute(box.x(), box.y())
      );
    } else {
      return Option.none();
    }
  });
};

const morphToFixed = (component: AlloyComponent, dockInfo: DockingConfig, viewport: Boxes.Bounds, scroll: SugarPosition, origin: SugarPosition): Option<DragCoord.CoordAdt> => {
  const loc = Location.absolute(component.element());
  const box = Boxes.bounds(loc.left(), loc.top(), Width.get(component.element()), Height.get(component.element()));
  if (! isCompletelyVisible(box, viewport)) {
    // Convert it to fixed (keeping the x coordinate and throwing away the y coordinate)
    setPrior(component, dockInfo, loc.left(), loc.top());
    // TODO: Move to generic area?
    const coord = DragCoord.absolute(loc.left(), loc.top());
    const asFixed = DragCoord.asFixed(coord, scroll, origin);

    // Check whether we are docking the bottom of the viewport, or the top
    const viewportPt = DragCoord.absolute(viewport.x(), viewport.y());
    const fixedViewport = DragCoord.asFixed(viewportPt, scroll, origin);
    const fixedY = box.y() <= viewport.y() ? fixedViewport.top() : fixedViewport.top() + viewport.height() - box.height();
    return Option.some(DragCoord.fixed(asFixed.left(), fixedY));
  } else {
    return Option.none();
  }
};

const getMorph = (component: AlloyComponent, dockInfo: DockingConfig, viewport: Boxes.Bounds, scroll: SugarPosition, origin: SugarPosition): Option<DragCoord.CoordAdt> => {
  const isDocked = Css.getRaw(component.element(), 'position').is('fixed');
  return isDocked ? morphToAbsolute(component, dockInfo, viewport) : morphToFixed(component, dockInfo, viewport, scroll, origin);
};

export {
  appear,
  disappear,
  isPartiallyVisible,
  getMorph
};
