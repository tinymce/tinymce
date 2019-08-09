import { document, Document, HTMLElement, Node as DomNode, Element as DomElement } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import Element from '../node/Element';
import * as PredicateExists from '../search/PredicateExists';
import * as Traverse from '../search/Traverse';
import * as Compare from './Compare';

const focus = function (element: Element<HTMLElement>) {
  element.dom().focus();
};

const blur = function (element: Element<HTMLElement>) {
  element.dom().blur();
};

const hasFocus = function (element: Element<DomNode>) {
  const doc = Traverse.owner(element).dom();
  return element.dom() === doc.activeElement;
};

const active = function (_doc?: Element<Document>) {
  const doc = _doc !== undefined ? _doc.dom() : document;
  // Note: assuming that activeElement will always be a HTMLElement (maybe we should add a runtime check?)
  return Option.from(doc.activeElement as HTMLElement).map(Element.fromDom);
};

const focusInside = function (element: Element<HTMLElement>) {
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
const search = function (element: Element<DomNode>) {
  return active(Traverse.owner(element)).filter(function (e) {
    return element.dom().contains(e.dom());
  });
};

export { hasFocus, focus, blur, active, search, focusInside, };
