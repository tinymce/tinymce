import { Node } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Insert, Remove, SelectorFind, SugarElement, Traverse } from '@ephox/sugar';

const getNode = function (container: SugarElement) {
  return SelectorFind.descendant(container, '.me').fold(function () {
    return SelectorFind.descendant(container, '.child').bind(Traverse.firstChild);
  }, function (v: SugarElement<Node>) {
    return Option.some(v);
  }).getOrDie('Could not find the descendant ".me" or the first child of the descendant ".child"');
};

const run = function (input: string, f: (e: SugarElement) => void) {
  const body = SelectorFind.first('body').getOrDie();
  const container = SugarElement.fromTag('div');
  Insert.append(body, container);
  container.dom().innerHTML = input;
  const node = getNode(container);
  f(node);
  Remove.remove(container);
};

export {
  run
};
