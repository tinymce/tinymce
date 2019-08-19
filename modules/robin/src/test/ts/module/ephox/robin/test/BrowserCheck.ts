import { Option } from '@ephox/katamari';
import { Element, Insert, Remove, SelectorFind, Traverse } from '@ephox/sugar';
import { Node as DomNode } from '@ephox/dom-globals';

const getNode = function (container: Element) {
  return SelectorFind.descendant(container, '.me').fold(function () {
    return SelectorFind.descendant(container, '.child').bind(Traverse.firstChild);
  }, function (v: Element<DomNode>) {
    return Option.some(v);
  }).getOrDie('Could not find the descendant ".me" or the first child of the descendant ".child"');
};

const run = function (input: string, f: (e: Element) => void) {
  const body = SelectorFind.first('body').getOrDie();
  const container = Element.fromTag('div');
  Insert.append(body, container);
  container.dom().innerHTML = input;
  const node = getNode(container);
  f(node);
  Remove.remove(container);
};

export default {
  run
};