import { Fun, Id, Optional } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';

import * as AlloyTags from '../ephemera/AlloyTags';
import * as AlloyLogger from '../log/AlloyLogger';

const prefix = AlloyTags.prefix();
const idAttr = AlloyTags.idAttr();

const write = (label: string, elem: SugarElement): string => {
  const id: string = Id.generate(prefix + label);
  writeOnly(elem, id);
  return id;
};

const writeOnly = (elem: SugarElement, uid: string | null) => {
  Object.defineProperty(elem.dom, idAttr, {
    value: uid,
    writable: true
  });
};

const read = (elem: SugarElement): Optional<string> => {
  const id = SugarNode.isElement(elem) ? (elem.dom as any)[idAttr] : null;
  return Optional.from(id);
};

const readOrDie = (elem: SugarElement): string => read(elem).getOrDie('Could not find alloy uid in: ' + AlloyLogger.element(elem));

const generate = (prefix: string): string => Id.generate(prefix);

const revoke = (elem: SugarElement): void => {
  // This looks like it is only used by ForeignGui, which is experimental.
  writeOnly(elem, null);
};

// TODO: Consider deprecating.
const attribute: () => string = Fun.constant(idAttr);

export {
  revoke,
  write,
  writeOnly,
  read,
  readOrDie,
  generate,
  attribute
};
