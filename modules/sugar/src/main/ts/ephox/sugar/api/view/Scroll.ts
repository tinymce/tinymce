import { Optional, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as Insert from '../dom/Insert';
import * as Remove from '../dom/Remove';
import * as SugarBody from '../node/SugarBody';
import { SugarElement } from '../node/SugarElement';
import * as SugarLocation from './SugarLocation';
import { SugarPosition } from './SugarPosition';

interface ScrollCapture {
  readonly save: () => void;
  readonly restore: () => void;
}

// get scroll position (x,y) relative to document _doc (or global if not supplied)
const get = (_DOC?: SugarElement<Document>): SugarPosition => {
  const doc = _DOC !== undefined ? _DOC.dom : document;

  // ASSUMPTION: This is for cross-browser support, body works for Safari & EDGE, and when we have an iframe body scroller
  const x = doc.body.scrollLeft || doc.documentElement.scrollLeft;
  const y = doc.body.scrollTop || doc.documentElement.scrollTop;
  return SugarPosition(x, y);
};

// Scroll content to (x,y) relative to document _doc (or global if not supplied)
const to = (x: number, y: number, _DOC?: SugarElement<Document>): void => {
  const doc = _DOC !== undefined ? _DOC.dom : document;
  const win = doc.defaultView;
  if (win) {
    win.scrollTo(x, y);
  }
};

// Scroll content by (x,y) relative to document _doc (or global if not supplied)
const by = (x: number, y: number, _DOC?: SugarElement<Document>): void => {
  const doc = _DOC !== undefined ? _DOC.dom : document;
  const win = doc.defaultView;
  if (win) {
    win.scrollBy(x, y);
  }
};

// Set the window scroll position to the element
const setToElement = (win: Window, element: SugarElement<Element>): void => {
  const pos = SugarLocation.absolute(element);
  const doc = SugarElement.fromDom(win.document);
  to(pos.left, pos.top, doc);
};

// call f() preserving the original scroll position relative to document doc
const preserve = (doc: SugarElement<Document>, f: () => void): void => {
  const before = get(doc);
  f();
  const after = get(doc);
  if (before.top !== after.top || before.left !== after.left) {
    to(before.left, before.top, doc);
  }
};

// capture the current scroll location and provide save and restore methods
const capture = (doc: SugarElement<Document>): ScrollCapture => {
  let previous = Optional.none<SugarPosition>();

  const save = () => {
    previous = Optional.some(get(doc));
  };

  // TODO: this is quite similar to the code in nomad.
  const restore = () => {
    previous.each((p) => {
      to(p.left, p.top, doc);
    });
  };

  save();
  return {
    save,      /* Saves the current page scroll position */
    restore /* Restores the page scroll to its former position when invoked */
  };
};

// TBIO-4472 Safari 10 - Scrolling typeahead with keyboard scrolls page
const intoView = (element: SugarElement<Element>, alignToTop: boolean): void => {
  const isSafari = PlatformDetection.detect().browser.isSafari();
  // this method isn't in TypeScript
  if (isSafari && Type.isFunction((element.dom as any).scrollIntoViewIfNeeded)) {
    (element.dom as any).scrollIntoViewIfNeeded(false); // false=align to nearest edge
  } else {
    element.dom.scrollIntoView(alignToTop); // true=to top, false=to bottom
  }
};

// If the element is above the container, or below the container, then scroll to the top or bottom
const intoViewIfNeeded = (element: SugarElement<Element>, container: SugarElement<Element>): void => {
  const containerBox = container.dom.getBoundingClientRect();
  const elementBox = element.dom.getBoundingClientRect();
  if (elementBox.top < containerBox.top) {
    // element top is above the viewport top, scroll so it's at the top
    intoView(element, true);
  } else if (elementBox.bottom > containerBox.bottom) {
    // element bottom is below the viewport bottom, scroll so it's at the bottom
    intoView(element, false);
  }
};

// Return the scroll bar width (calculated by temporarily inserting an element into the dom)
const scrollBarWidth = (): number => {
  // From https://davidwalsh.name/detect-scrollbar-width
  const scrollDiv = SugarElement.fromHtml<HTMLDivElement>('<div style="width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;"></div>');
  Insert.after(SugarBody.body(), scrollDiv);
  const w = scrollDiv.dom.offsetWidth - scrollDiv.dom.clientWidth;
  Remove.remove(scrollDiv);
  return w;
};

export { get, to, by, preserve, capture, intoView, intoViewIfNeeded, setToElement, scrollBarWidth };
