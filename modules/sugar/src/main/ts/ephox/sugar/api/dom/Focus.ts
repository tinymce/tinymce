import { document, Document, HTMLElement, Node as DomNode } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import Element from '../node/Element';
import * as PredicateExists from '../search/PredicateExists';
import * as Traverse from '../search/Traverse';
import * as Compare from './Compare';

const focus = (element: Element<HTMLElement>) => element.dom().focus();

const blur = (element: Element<HTMLElement>) => element.dom().blur();

const hasFocus = (element: Element<DomNode>) => {
  const doc = Traverse.owner(element).dom();
  return element.dom() === doc.activeElement;
};

const active = (_doc?: Element<Document>) => {
  const doc = _doc !== undefined ? _doc.dom() : document;
  // Note: assuming that activeElement will always be a HTMLElement (maybe we should add a runtime check?)
  return Option.from(doc.activeElement as HTMLElement).map(Element.fromDom);
};

const focusInside = (element: Element<HTMLElement>) => {
  // Only call focus if the focus is not already inside it.
  const doc = Traverse.owner(element);
  const inside = active(doc).filter((a) => PredicateExists.closest(a, Fun.curry(Compare.eq, element)));

  inside.fold(() => {
    focus(element);
  }, Fun.noop);
};

/**
 * Return the descendant element that has focus.
 * Use instead of SelectorFind.descendant(container, ':focus')
 *  because the :focus selector relies on keyboard focus.
 */
const search = (element: Element<DomNode>) => active(Traverse.owner(element))
  .filter((e) => element.dom().contains(e.dom()));

export { hasFocus, focus, blur, active, search, focusInside };
