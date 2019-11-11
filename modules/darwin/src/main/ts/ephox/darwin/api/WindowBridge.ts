import { ClientRect, DOMRect, Element as DomElement, Window } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Element, RawRect, Rect, Scroll, Selection, SimRange, Situ, WindowSelection } from '@ephox/sugar';
import { Situs } from '../selection/Situs';
import Util from '../selection/Util';

export interface WindowBridge {
  elementFromPoint: (x: number, y: number) => Option<Element>;
  getRect: (element: Element) => ClientRect | DOMRect;
  getRangedRect: (start: Element, soffset: number, finish: Element, foffset: number) => Option<RawRect>;
  getSelection: () => Option<SimRange>;
  fromSitus: (situs: Situs) => SimRange;
  situsFromPoint: (x: number, y: number) => Option<Situs>;
  clearSelection: () => void;
  collapseSelection: (toStart?: boolean) => void;
  setSelection: (sel: SimRange) => void;
  setRelativeSelection: (start: Situ, finish: Situ) => void;
  selectContents: (element: Element) => void;
  getInnerHeight: () => number;
  getScrollY: () => number;
  scrollBy: (x: number, y: number) => void;
}

export const WindowBridge = function (win: Window): WindowBridge {
  const elementFromPoint = function (x: number, y: number) {
    return Element.fromPoint(Element.fromDom(win.document), x, y);
  };

  const getRect = function (element: Element) {
    return (element.dom() as DomElement).getBoundingClientRect();
  };

  const getRangedRect = function (start: Element, soffset: number, finish: Element, foffset: number): Option<RawRect> {
    const sel = Selection.exact(start, soffset, finish, foffset);
    return WindowSelection.getFirstRect(win, sel).map(Rect.toRaw);
  };

  const getSelection = function () {
    return WindowSelection.get(win).map(function (exactAdt) {
      return Util.convertToRange(win, exactAdt);
    });
  };

  const fromSitus = function (situs: Situs) {
    const relative = Selection.relative(situs.start(), situs.finish());
    return Util.convertToRange(win, relative);
  };

  const situsFromPoint = function (x: number, y: number) {
    return WindowSelection.getAtPoint(win, x, y).map(function (exact) {
      return Situs.create(exact.start(), exact.soffset(), exact.finish(), exact.foffset());
    });
  };

  const clearSelection = function () {
    WindowSelection.clear(win);
  };

  const collapseSelection = function (toStart: boolean = false) {
    WindowSelection.get(win).each((sel) => sel.fold(
      (rng) => rng.collapse(toStart),
      (startSitu, finishSitu) => {
        const situ = toStart ? startSitu : finishSitu;
        WindowSelection.setRelative(win, situ, situ);
      },
      (start, soffset, finish, foffset) => {
        const node = toStart ? start : finish;
        const offset = toStart ? soffset : foffset;
        WindowSelection.setExact(win, node, offset, node, offset);
      }
    ));
  };

  const selectContents = function (element: Element) {
    WindowSelection.setToElement(win, element);
  };

  const setSelection = function (sel: SimRange) {
    WindowSelection.setExact(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
  };

  const setRelativeSelection = function (start: Situ, finish: Situ) {
    WindowSelection.setRelative(win, start, finish);
  };

  const getInnerHeight = function () {
    return win.innerHeight;
  };

  const getScrollY = function () {
    const pos = Scroll.get(Element.fromDom(win.document));
    return pos.top();
  };

  const scrollBy = function (x: number, y: number) {
    Scroll.by(x, y, Element.fromDom(win.document));
  };

  return {
    elementFromPoint,
    getRect,
    getRangedRect,
    getSelection,
    fromSitus,
    situsFromPoint,
    clearSelection,
    collapseSelection,
    setSelection,
    setRelativeSelection,
    selectContents,
    getInnerHeight,
    getScrollY,
    scrollBy
  };
};
