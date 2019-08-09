import { document, Document, HTMLElement, Node as DomNode } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import Element from '../node/Element';
import * as PredicateExists from '../search/PredicateExists';
import * as Traverse from '../search/Traverse';
import * as Compare from './Compare';

const focus = function <E extends HTMLElement> (element: Element<E>) {
  element.dom().focus();
};

const blur = function <E extends HTMLElement> (element: Element<E>) {
  element.dom().blur();
};

const hasFocus = function <E extends HTMLElement> (element: Element<E>) {
  const doc = Traverse.owner(element).dom();
  return element.dom() === doc.activeElement;
};

const active = function (_doc?: Element<Document>) {
  const doc = _doc !== undefined ? _doc.dom() : document;
  return Option.from(doc.activeElement as HTMLElement).map(Element.fromDom);
};

const focusInside = function <E extends HTMLElement> (element: Element<E>) {
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
const search = function <E extends DomNode> (element: Element<E>) {
  return active(Traverse.owner(element)).filter(function (e) {
    return element.dom().contains(e.dom());
  });
};

export { hasFocus, focus, blur, active, search, focusInside, };
