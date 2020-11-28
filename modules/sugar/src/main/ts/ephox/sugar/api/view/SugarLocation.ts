import { inBody } from '../node/SugarBody';
import { SugarElement } from '../node/SugarElement';
import { SugarPosition } from './SugarPosition';

const boxPosition = (dom: Element): SugarPosition => {
  const box = dom.getBoundingClientRect();
  return SugarPosition(box.left, box.top);
};

// Avoids falsy false fallthrough
const firstDefinedOrZero = (a?: number, b?: number): number => {
  if (a !== undefined) {
    return a;
  } else {
    return b !== undefined ? b : 0;
  }
};

const absolute = (element: SugarElement<Element>): SugarPosition => {
  const doc = element.dom.ownerDocument;
  const body = doc.body;
  const win = doc.defaultView;
  const html = doc.documentElement;

  if (body === element.dom) {
    return SugarPosition(body.offsetLeft, body.offsetTop);
  }

  const scrollTop = firstDefinedOrZero(win?.pageYOffset, html.scrollTop);
  const scrollLeft = firstDefinedOrZero(win?.pageXOffset, html.scrollLeft);

  const clientTop = firstDefinedOrZero(html.clientTop, body.clientTop);
  const clientLeft = firstDefinedOrZero(html.clientLeft, body.clientLeft);

  return viewport(element).translate(
    scrollLeft - clientLeft,
    scrollTop - clientTop);
};

// This is the old $.position(), but JQuery does nonsense calculations.
// We're only 1 <-> 1 with the old value in the single place we use this function
// (ego.api.Dragging) so the rest can bite me.
const relative = (element: SugarElement<HTMLElement>): SugarPosition => {
  const dom = element.dom;
  // jquery-ism: when style="position: fixed", this === boxPosition()
  // but tests reveal it returns the same thing anyway
  return SugarPosition(dom.offsetLeft, dom.offsetTop);
};

const viewport = (element: SugarElement<Element>): SugarPosition => {
  const dom = element.dom;

  const doc = dom.ownerDocument;
  const body = doc.body;

  if (body === dom) {
    return SugarPosition(body.offsetLeft, body.offsetTop);
  }

  if (!inBody(element)) {
    return SugarPosition(0, 0);
  }

  return boxPosition(dom);
};

export {
  absolute,
  relative,
  viewport
};
