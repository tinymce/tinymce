import { Option } from '@ephox/katamari';
import { Attr, Class, Css, Height, Location, Width } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as DragCoord from '../../api/data/DragCoord';

const appear = function (component, contextualInfo) {
  Class.add(component.element(), contextualInfo.transitionClass());
  Class.remove(component.element(), contextualInfo.fadeOutClass());
  Class.add(component.element(), contextualInfo.fadeInClass());
};

const disappear = function (component, contextualInfo) {
  Class.add(component.element(), contextualInfo.transitionClass());
  Class.remove(component.element(), contextualInfo.fadeInClass());
  Class.add(component.element(), contextualInfo.fadeOutClass());
};

const isPartiallyVisible = function (box, viewport) {
  return box.y() < viewport.bottom() && box.bottom() > viewport.y();
};

const isCompletelyVisible = function (box, viewport) {
  return box.y() >= viewport.y() && box.bottom() <= viewport.bottom();
};

const getAttr = function (elem, attr) {
  return Attr.has(elem, attr) ? Option.some(
    parseInt(Attr.get(elem, attr), 10)
  ) : Option.none();
};

const getPrior = function (component, dockInfo) {
  const elem = component.element();
  return getAttr(elem, dockInfo.leftAttr()).bind(function (left) {
    return getAttr(elem, dockInfo.topAttr()).map(function (top) {
      // Only supports position absolute.
      const w = Width.get(component.element());
      const h = Height.get(component.element());
      return Boxes.bounds(left, top, w, h);
    });
  });
};

const setPrior = function (component, dockInfo, absLeft, absTop) {
  const elem = component.element();
  Attr.set(elem, dockInfo.leftAttr(), absLeft);
  Attr.set(elem, dockInfo.topAttr(), absTop);
};

const clearPrior = function (component, dockInfo) {
  const elem = component.element();
  Attr.remove(elem, dockInfo.leftAttr());
  Attr.remove(elem, dockInfo.topAttr());
};

const morphToAbsolute = function (component, dockInfo, viewport) {
  return getPrior(component, dockInfo).bind(function (box) {
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

const morphToFixed = function (component, dockInfo, viewport, scroll, origin) {
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

const getMorph = function (component, dockInfo, viewport, scroll, origin) {
  const isDocked = Css.getRaw(component.element(), 'position').is('fixed');
  return isDocked ? morphToAbsolute(component, dockInfo, viewport) : morphToFixed(component, dockInfo, viewport, scroll, origin);
};

export {
  appear,
  disappear,
  isPartiallyVisible,
  getMorph
};