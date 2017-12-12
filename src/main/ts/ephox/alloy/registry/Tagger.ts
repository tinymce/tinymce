import AlloyTags from '../ephemera/AlloyTags';
import { Id } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';

var prefix = AlloyTags.prefix();
var idAttr = AlloyTags.idAttr();

var write = function (label, elem) {
  var id = Id.generate(prefix + label);
  Attr.set(elem, idAttr, id);
  return id;
};

var writeOnly = function (elem, uid) {
  Attr.set(elem, idAttr, uid);
};

var read = function (elem) {
  var id = Node.isElement(elem) ? Attr.get(elem, idAttr) : null;
  return Option.from(id);
};

var find = function (container, id) {
  return SelectorFind.descendant(container, id);
};

var generate = function (prefix) {
  return Id.generate(prefix);
};

var revoke = function (elem) {
  Attr.remove(elem, idAttr);
};

export default <any> {
  revoke: revoke,
  write: write,
  writeOnly: writeOnly,
  read: read,
  find: find,
  generate: generate,
  attribute: Fun.constant(idAttr)
};