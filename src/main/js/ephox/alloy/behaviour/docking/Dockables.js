import Boxes from '../../alien/Boxes';
import DragCoord from '../../api/data/DragCoord';
import { Option } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Height } from '@ephox/sugar';
import { Location } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

var appear = function (component, contextualInfo) {
  Class.add(component.element(), contextualInfo.transitionClass());
  Class.remove(component.element(), contextualInfo.fadeOutClass());
  Class.add(component.element(), contextualInfo.fadeInClass());
};

var disappear = function (component, contextualInfo) {
  Class.add(component.element(), contextualInfo.transitionClass());
  Class.remove(component.element(), contextualInfo.fadeInClass());
  Class.add(component.element(), contextualInfo.fadeOutClass());
};

var isPartiallyVisible = function (box, viewport) {
  return box.y() < viewport.bottom() && box.bottom() > viewport.y();
};

var isCompletelyVisible = function (box, viewport) {
  return box.y() >= viewport.y() && box.bottom() <= viewport.bottom();
};

var getAttr = function (elem, attr) {
  return Attr.has(elem, attr) ? Option.some(
    parseInt(Attr.get(elem, attr), 10)
  ) : Option.none();
};

var getPrior = function (component, dockInfo) {
  var elem = component.element();
  return getAttr(elem, dockInfo.leftAttr()).bind(function (left) {
    return getAttr(elem, dockInfo.topAttr()).map(function (top) {
      // Only supports position absolute.
      var w = Width.get(component.element());
      var h = Height.get(component.element());
      return Boxes.bounds(left, top, w, h);
    });
  });
};

var setPrior = function (component, dockInfo, absLeft, absTop) {
  var elem = component.element();
  Attr.set(elem, dockInfo.leftAttr(), absLeft);
  Attr.set(elem, dockInfo.topAttr(), absTop);
};

var clearPrior = function (component, dockInfo) {
  var elem = component.element();
  Attr.remove(elem, dockInfo.leftAttr());
  Attr.remove(elem, dockInfo.topAttr());
};

var morphToAbsolute = function (component, dockInfo, viewport) {
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

var morphToFixed = function (component, dockInfo, viewport, scroll, origin) {
  var loc = Location.absolute(component.element());
  var box = Boxes.bounds(loc.left(), loc.top(), Width.get(component.element()), Height.get(component.element()));
  if (! isCompletelyVisible(box, viewport)) {
    // Convert it to fixed (keeping the x coordinate and throwing away the y coordinate)
    setPrior(component, dockInfo, loc.left(), loc.top());
    // TODO: Move to generic area?
    var coord = DragCoord.absolute(loc.left(), loc.top());
    var asFixed = DragCoord.asFixed(coord, scroll, origin);

    // Check whether we are docking the bottom of the viewport, or the top
    var viewportPt = DragCoord.absolute(viewport.x(), viewport.y());
    var fixedViewport = DragCoord.asFixed(viewportPt, scroll, origin);
    var fixedY = box.y() <= viewport.y() ? fixedViewport.top() : fixedViewport.top() + viewport.height() - box.height();
    return Option.some(DragCoord.fixed(asFixed.left(), fixedY));
  } else {
    return Option.none();
  }
};

var getMorph = function (component, dockInfo, viewport, scroll, origin) {
  var isDocked = Css.getRaw(component.element(), 'position').is('fixed');
  return isDocked ? morphToAbsolute(component, dockInfo, viewport) : morphToFixed(component, dockInfo, viewport, scroll, origin);
};

export default <any> {
  appear: appear,
  disappear: disappear,
  isPartiallyVisible: isPartiallyVisible,
  getMorph: getMorph
};