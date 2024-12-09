import { Arr, Obj } from '@ephox/katamari';

import { HTMLElementFullTagNameMap } from '../../alien/DomTypes';
import { SugarElement } from '../node/SugarElement';
import * as Attribute from '../properties/Attribute';
import * as Traverse from '../search/Traverse';
import * as Insert from './Insert';
import * as InsertAll from './InsertAll';
import * as Remove from './Remove';

// eslint-disable-next-line max-len
const startAttributeCharacterLayout = '[A-Za-z:_]|[\u{C0}-\u{D6}]|[\u{D8}-\u{F6}]|[\u{F8}-\u{2FF}]|[\u{370}-\u{37D}]|[\u{37F}-\u{1FFF}]|[\u{200C}-\u{200D}]|[\u{2070}-\u{218F}]|[\u{2C00}-\u{2FEF}]|[\u{3001}-\u{D7FF}]|[\u{F900}-\u{FDCF}]|[\u{FDF0}-\u{FFFD}]';// |[\u{10000}-\u{EFFFF}]';
const followingAttributeCharacterLayout = startAttributeCharacterLayout + '|"-"|"."|[0-9]|\u{B7}|[\u{0300}-\u{036F}]|[\u{203F}-\u{2040}]';
const attributeNameRegex = RegExp(`^(${startAttributeCharacterLayout})(${followingAttributeCharacterLayout})*$`);

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
  Arr.each(Obj.keys(attributes), (key) => {
    if (!attributeNameRegex.test(key)) {
      delete attributes[key];
    }
  });
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
