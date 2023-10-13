import { Optional } from '@ephox/katamari';

import * as SugarDocument from '../node/SugarDocument';
import { SugarElement } from '../node/SugarElement';
import * as SugarShadowDom from '../node/SugarShadowDom';

type RootNode = SugarShadowDom.RootNode;

const focus = (element: SugarElement<HTMLElement>, preventScroll: boolean = false): void =>
  element.dom.focus({ preventScroll });

const blur = (element: SugarElement<HTMLElement>): void =>
  element.dom.blur();

const hasFocus = (element: SugarElement<Node>): boolean => {
  const root = SugarShadowDom.getRootNode(element).dom;
  return element.dom === root.activeElement;
};

// Note: assuming that activeElement will always be a HTMLElement (maybe we should add a runtime check?)
const active = <T extends HTMLElement>(root: RootNode = SugarDocument.getDocument()): Optional<SugarElement<T>> =>
  Optional.from(root.dom.activeElement as T).map(SugarElement.fromDom);

/** Focus the specified element, unless one of its descendents already has focus. */
const focusInside = (element: SugarElement<HTMLElement>): void => {
  const alreadyFocusedInside = search(element).isSome();
  if (!alreadyFocusedInside) {
    focus(element);
  }
};

/**
 * Return the descendant element that has focus.
 * Use instead of SelectorFind.descendant(container, ':focus')
 *  because the :focus selector relies on keyboard focus.
 */
const search = (element: SugarElement<Node>): Optional<SugarElement<HTMLElement>> =>
  active(SugarShadowDom.getRootNode(element))
    .filter((e) => element.dom.contains(e.dom));

export { hasFocus, focus, blur, active, search, focusInside };
