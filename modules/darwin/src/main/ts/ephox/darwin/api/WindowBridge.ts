import { Optional } from '@ephox/katamari';
import { RawRect, Scroll, SimRange, SimSelection, Situ, SugarElement, WindowSelection } from '@ephox/sugar';

import { Situs } from '../selection/Situs';
import * as Util from '../selection/Util';

export interface WindowBridge {
  elementFromPoint: (x: number, y: number) => Optional<SugarElement<Element>>;
  getRect: (element: SugarElement<Element>) => ClientRect | DOMRect;
  getRangedRect: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => Optional<RawRect>;
  getSelection: () => Optional<SimRange>;
  fromSitus: (situs: Situs) => SimRange;
  situsFromPoint: (x: number, y: number) => Optional<Situs>;
  clearSelection: () => void;
  collapseSelection: (toStart?: boolean) => void;
  setSelection: (sel: SimRange) => void;
  setRelativeSelection: (start: Situ, finish: Situ) => void;
  selectContents: (element: SugarElement<Node>) => void;
  selectNode: (element: SugarElement<Node>) => void;
  getInnerHeight: () => number;
  getScrollY: () => number;
  scrollBy: (x: number, y: number) => void;
}

export const WindowBridge = (win: Window): WindowBridge => {
  const elementFromPoint = (x: number, y: number) => {
    return SugarElement.fromPoint(SugarElement.fromDom(win.document), x, y);
  };

  const getRect = (element: SugarElement<Element>) => {
    return element.dom.getBoundingClientRect();
  };

  const getRangedRect = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number): Optional<RawRect> => {
    const sel = SimSelection.exact(start, soffset, finish, foffset);
    return WindowSelection.getFirstRect(win, sel);
  };

  const getSelection = () => {
    return WindowSelection.get(win).map((exactAdt) => {
      return Util.convertToRange(win, exactAdt);
    });
  };

  const fromSitus = (situs: Situs) => {
    const relative = SimSelection.relative(situs.start, situs.finish);
    return Util.convertToRange(win, relative);
  };

  const situsFromPoint = (x: number, y: number) => {
    return WindowSelection.getAtPoint(win, x, y).map((exact) => {
      return Situs.create(exact.start, exact.soffset, exact.finish, exact.foffset);
    });
  };

  const clearSelection = () => {
    WindowSelection.clear(win);
  };

  const collapseSelection = (toStart: boolean = false) => {
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

  const selectNode = (element: SugarElement<Node>) => {
    WindowSelection.setToElement(win, element, false);
  };

  const selectContents = (element: SugarElement<Node>) => {
    WindowSelection.setToElement(win, element);
  };

  const setSelection = (sel: SimRange) => {
    WindowSelection.setExact(win, sel.start, sel.soffset, sel.finish, sel.foffset);
  };

  const setRelativeSelection = (start: Situ, finish: Situ) => {
    WindowSelection.setRelative(win, start, finish);
  };

  const getInnerHeight = () => {
    return win.innerHeight;
  };

  const getScrollY = () => {
    const pos = Scroll.get(SugarElement.fromDom(win.document));
    return pos.top;
  };

  const scrollBy = (x: number, y: number) => {
    Scroll.by(x, y, SugarElement.fromDom(win.document));
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
    selectNode,
    selectContents,
    getInnerHeight,
    getScrollY,
    scrollBy
  };
};
