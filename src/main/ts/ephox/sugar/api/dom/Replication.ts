import * as Attr from '../properties/Attr';
import Element from '../node/Element';
import * as Insert from './Insert';
import * as InsertAll from './InsertAll';
import * as Remove from './Remove';
import * as Traverse from '../search/Traverse';

const clone = function (original: Element, isDeep: boolean) {
  return Element.fromDom(original.dom().cloneNode(isDeep));
};

/** Shallow clone - just the tag, no children */
const shallow = function (original: Element) {
  return clone(original, false);
};

/** Deep clone - everything copied including children */
const deep = function (original: Element) {
  return clone(original, true);
};

/** Shallow clone, with a new tag */
const shallowAs = function (original: Element, tag: string) {
  const nu = Element.fromTag(tag);

  const attributes = Attr.clone(original);
  Attr.setAll(nu, attributes);

  return nu;
};

/** Deep clone, with a new tag */
const copy = function (original: Element, tag: string) {
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
const mutate = function (original: Element, tag: string) {
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
  mutate,
};