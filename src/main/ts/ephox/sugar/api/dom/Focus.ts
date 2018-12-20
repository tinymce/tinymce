import { document, Document, HTMLElement } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import Element from '../node/Element';
import * as PredicateExists from '../search/PredicateExists';
import * as Traverse from '../search/Traverse';
import * as Compare from './Compare';

const focus = function (element: Element) {
  (element.dom() as HTMLElement).focus();
};

const blur = function (element: Element) {
  (element.dom() as HTMLElement).blur();
};

const hasFocus = function (element: Element) {
  const doc = Traverse.owner(element).dom() as Document;
  return element.dom() === doc.activeElement;
};

const active = function (_DOC?: any) {
  const doc = _DOC !== undefined ? _DOC.dom() : document;
  return Option.from(doc.activeElement).map(Element.fromDom);
};

const focusInside = function (element: Element) {
  // Only call focus if the focus is not already inside it.
  const doc = Traverse.owner(element);
  const inside = active(doc).filter(function (a) {
    return PredicateExists.closest(a, Fun.curry(Compare.eq, element));
  });

  inside.fold(function () {
    focus(element);
  }, Fun.noop);
};

/**
 * Return the descendant element that has focus.
 * Use instead of SelectorFind.descendant(container, ':focus')
 *  because the :focus selector relies on keyboard focus.
 */
const search = function (element: Element) {
  return active(Traverse.owner(element)).filter(function (e: any) {
    return element.dom().contains(e.dom());
  });
};

export { hasFocus, focus, blur, active, search, focusInside, };
