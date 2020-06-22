import { HTMLElement, Node as DomNode } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import Element from '../node/Element';
import * as PredicateExists from '../search/PredicateExists';
import * as Compare from './Compare';
import * as ShadowDom from '../node/ShadowDom';
import * as Document from '../node/Document';

type RootNode = ShadowDom.RootNode;

const focus = (element: Element<HTMLElement>): void =>
  element.dom().focus();

const blur = (element: Element<HTMLElement>): void =>
  element.dom().blur();

const hasFocus = (element: Element<DomNode>): boolean => {
  const root = ShadowDom.getRootNode(element).dom();
  return element.dom() === root.activeElement;
};

const active = (root: RootNode = Document.getDocument()): Option<Element<HTMLElement>> => {
  // Note: assuming that activeElement will always be a HTMLElement (maybe we should add a runtime check?)
  return Option.from(root.dom().activeElement as HTMLElement).map(Element.fromDom);
};

/** Focus the specified element, unless one of its descendents already has focus. */
const focusInside = (element: Element<HTMLElement>): void => {
  const root = ShadowDom.getRootNode(element);
  const alreadyFocusedInside = active(root).exists((a) => PredicateExists.closest(a, Fun.curry(Compare.eq, element)));
  if (!alreadyFocusedInside) {
    focus(element);
  }
};

/**
 * Return the descendant element that has focus.
 * Use instead of SelectorFind.descendant(container, ':focus')
 *  because the :focus selector relies on keyboard focus.
 */
const search = (element: Element<DomNode>): Option<Element<HTMLElement>> =>
  active(ShadowDom.getRootNode(element))
    .filter((e) => element.dom().contains(e.dom()));

export { hasFocus, focus, blur, active, search, focusInside };
