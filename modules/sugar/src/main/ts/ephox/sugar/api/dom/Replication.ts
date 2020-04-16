import { Element as DomElement, HTMLElementTagNameMap, Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as Attr from '../properties/Attr';
import * as Traverse from '../search/Traverse';
import * as Insert from './Insert';
import * as InsertAll from './InsertAll';
import * as Remove from './Remove';

const clone = <E extends DomNode> (original: Element<E>, isDeep: boolean) => Element.fromDom(original.dom().cloneNode(isDeep) as E);

/** Shallow clone - just the tag, no children */
const shallow = <E extends DomNode> (original: Element<E>) => clone(original, false);

/** Deep clone - everything copied including children */
const deep = <E extends DomNode> (original: Element<E>) => clone(original, true);

/** Shallow clone, with a new tag */
const shallowAs = <K extends keyof HTMLElementTagNameMap> (original: Element<DomElement>, tag: K): Element<HTMLElementTagNameMap[K]> => {
  const nu = Element.fromTag(tag);

  const attributes = Attr.clone(original);
  Attr.setAll(nu, attributes);

  return nu;
};

/** Deep clone, with a new tag */
const copy = <K extends keyof HTMLElementTagNameMap> (original: Element<DomElement>, tag: K) => {
  const nu = shallowAs(original, tag);

  // NOTE
  // previously this used serialisation:
  // nu.dom().innerHTML = original.dom().innerHTML;
  //
  // Clone should be equivalent (and faster), but if TD <-> TH toggle breaks, put it back.

  const cloneChildren = Traverse.children(deep(original));
  InsertAll.append(nu, cloneChildren);

  return nu;
};

/** Change the tag name, but keep all children */
const mutate = <K extends keyof HTMLElementTagNameMap> (original: Element<DomElement>, tag: K) => {
  const nu = shallowAs(original, tag);

  Insert.before(original, nu);
  const children = Traverse.children(original);
  InsertAll.append(nu, children);
  Remove.remove(original);
  return nu;
};

export {
  shallow,
  shallowAs,
  deep,
  copy,
  mutate
};
