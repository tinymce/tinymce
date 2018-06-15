import { Fun, Id, Option } from '@ephox/katamari';
import { Attr, Node, SelectorFind } from '@ephox/sugar';

import * as AlloyTags from '../ephemera/AlloyTags';
import { SugarElement } from '../alien/TypeDefinitions';

const prefix = AlloyTags.prefix();
const idAttr = AlloyTags.idAttr();

const write = (label: string, elem: SugarElement): string => {
  const id: string = Id.generate(prefix + label);
  Attr.set(elem, idAttr, id);
  return id;
};

const writeOnly = (elem: SugarElement, uid: string) => {
  Attr.set(elem, idAttr, uid);
};

const read = (elem: SugarElement): Option<string> => {
  const id = Node.isElement(elem) ? Attr.get(elem, idAttr) : null;
  return Option.from(id);
};

// const find = (container: SugarElement, id: string): Option<SugarElement> => {
//   return SelectorFind.descendant(container, id);
// };

const generate = (prefix: string): string => {
  return Id.generate(prefix);
};

const revoke = (elem: SugarElement): void => {
  Attr.remove(elem, idAttr);
};

const attribute: () => string = Fun.constant(idAttr);
export {
  revoke,
  write,
  writeOnly,
  read,
  // find,
  generate,
  attribute
};