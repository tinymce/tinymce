import { HTMLElementFullTagNameMap } from '../../alien/DomTypes';
import { SugarElement } from '../node/SugarElement';
import * as Attribute from '../properties/Attribute';
import * as Traverse from '../search/Traverse';
import * as Insert from './Insert';
import * as InsertAll from './InsertAll';
import * as Remove from './Remove';

const clone = <E extends Node> (original: SugarElement<E>, isDeep: boolean): SugarElement<E> =>
  SugarElement.fromDom(original.dom.cloneNode(isDeep) as E);

/** Shallow clone - just the tag, no children */
const shallow = <E extends Node> (original: SugarElement<E>): SugarElement<E> =>
  clone(original, false);

/** Deep clone - everything copied including children */
const deep = <E extends Node> (original: SugarElement<E>): SugarElement<E> =>
  clone(original, true);

/** Shallow clone, with a new tag */
const shallowAs = <K extends keyof HTMLElementFullTagNameMap> (original: SugarElement<Element>, tag: K): SugarElement<HTMLElementFullTagNameMap[K]> => {
  const nu = SugarElement.fromTag(tag);

  const attributes = Attribute.clone(original);
  Attribute.setAll(nu, attributes);

  return nu;
};

/** Deep clone, with a new tag */
const copy = <K extends keyof HTMLElementFullTagNameMap> (original: SugarElement<Element>, tag: K): SugarElement<HTMLElementFullTagNameMap[K]> => {
  const nu = shallowAs(original, tag);

  // NOTE
  // previously this used serialisation:
  // nu.dom.innerHTML = original.dom.innerHTML;
  //
  // Clone should be equivalent (and faster), but if TD <-> TH toggle breaks, put it back.

  const cloneChildren = Traverse.children(deep(original));
  InsertAll.append(nu, cloneChildren);

  return nu;
};

/** Change the tag name, but keep all children */
const mutate = <K extends keyof HTMLElementFullTagNameMap> (original: SugarElement<Element>, tag: K): SugarElement<HTMLElementFullTagNameMap[K]> => {
  const nu = shallowAs(original, tag);

  Insert.after(original, nu);
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
