import { Fun, Id, Option } from '@ephox/katamari';
import { Attr, Node, SelectorFind } from '@ephox/sugar';

import * as AlloyTags from '../ephemera/AlloyTags';
import { SugarElement } from '../alien/TypeDefinitions';

const prefix = AlloyTags.prefix();
const idAttr = AlloyTags.idAttr();

const write = (label, elem) => {
  const id = Id.generate(prefix + label);
  Attr.set(elem, idAttr, id);
  return id;
};

const writeOnly = (elem, uid) => {
  Attr.set(elem, idAttr, uid);
};

const read = (elem: SugarElement): Option<any> => {
  const id = Node.isElement(elem) ? Attr.get(elem, idAttr) : null;
  return Option.from(id);
};

const find = (container, id) => {
  return SelectorFind.descendant(container, id);
};

const generate = (prefix) => {
  return Id.generate(prefix);
};

const revoke = (elem) => {
  Attr.remove(elem, idAttr);
};

const attribute = Fun.constant(idAttr);
export {
  revoke,
  write,
  writeOnly,
  read,
  find,
  generate,
  attribute
};