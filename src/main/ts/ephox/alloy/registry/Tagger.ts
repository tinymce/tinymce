import { Fun, Id, Option } from '@ephox/katamari';
import { Attr, Node, SelectorFind } from '@ephox/sugar';

import * as AlloyTags from '../ephemera/AlloyTags';

const prefix = AlloyTags.prefix();
const idAttr = AlloyTags.idAttr();

const write = function (label, elem) {
  const id = Id.generate(prefix + label);
  Attr.set(elem, idAttr, id);
  return id;
};

const writeOnly = function (elem, uid) {
  Attr.set(elem, idAttr, uid);
};

const read = function (elem) {
  const id = Node.isElement(elem) ? Attr.get(elem, idAttr) : null;
  return Option.from(id);
};

const find = function (container, id) {
  return SelectorFind.descendant(container, id);
};

const generate = function (prefix) {
  return Id.generate(prefix);
};

const revoke = function (elem) {
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