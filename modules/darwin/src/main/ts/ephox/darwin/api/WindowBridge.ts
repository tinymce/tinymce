import Util from '../selection/Util';
import { Fun } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Selection } from '@ephox/sugar';
import { Situ } from '@ephox/sugar';
import { WindowSelection } from '@ephox/sugar';
import { Scroll } from '@ephox/sugar';



export default <any> function (win) {
  var elementFromPoint = function (x, y) {
    return Element.fromPoint(Element.fromDom(win.document), x, y);
  };

  var getRect = function (element) {
    return element.dom().getBoundingClientRect();
  };

  var getRangedRect = function (start, soffset, finish, foffset) {
    var sel = Selection.exact(start, soffset, finish, foffset);
    return WindowSelection.getFirstRect(win, sel).map(function (structRect) {
      return Obj.map(structRect, Fun.apply);
    });
  };

  var getSelection = function () {
    return WindowSelection.get(win).map(function (exactAdt) {
      return Util.convertToRange(win, exactAdt);
    });
  };

  var fromSitus = function (situs) {
    var relative = Selection.relative(situs.start(), situs.finish());
    return Util.convertToRange(win, relative);
  };

  var situsFromPoint = function (x, y) {
    return WindowSelection.getAtPoint(win, x, y).map(function (exact) {
      return {
        start: Fun.constant(Situ.on(exact.start(), exact.soffset())),
        finish: Fun.constant(Situ.on(exact.finish(), exact.foffset()))
      };
    });
  };

  var clearSelection = function () {
    WindowSelection.clear(win);
  };

  var selectContents = function (element) {
    WindowSelection.setToElement(win, element);
  };

  var setSelection = function (sel) {
    WindowSelection.setExact(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
  };

  var setRelativeSelection = function (start, finish) {
    WindowSelection.setRelative(win, start, finish);
  };

  var getInnerHeight = function () {
    return win.innerHeight;
  };

  var getScrollY = function () {
    var pos = Scroll.get(Element.fromDom(win.document));
    return pos.top();
  };

  var scrollBy = function (x, y) {
    Scroll.by(x, y, Element.fromDom(win.document));
  };

  return {
    elementFromPoint: elementFromPoint,
    getRect: getRect,
    getRangedRect: getRangedRect,
    getSelection: getSelection,
    fromSitus: fromSitus,
    situsFromPoint: situsFromPoint,
    clearSelection: clearSelection,
    setSelection: setSelection,
    setRelativeSelection: setRelativeSelection,
    selectContents: selectContents,
    getInnerHeight: getInnerHeight,
    getScrollY: getScrollY,
    scrollBy: scrollBy
  };
};