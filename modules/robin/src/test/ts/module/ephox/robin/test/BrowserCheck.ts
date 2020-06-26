import { Option } from '@ephox/katamari';
import { Element, Insert, Remove, SelectorFind, Traverse } from '@ephox/sugar';
import { Node as DomNode } from '@ephox/dom-globals';

const getNode = (container: Element<DomNode>): Element<DomNode> =>
  SelectorFind.descendant(container, '.me').fold<Option<Element<DomNode>>>(
    () => SelectorFind.descendant(container, '.child').bind(Traverse.firstChild).map<Element<DomNode>>((x) => x),
    (v) => Option.some<Element<DomNode>>(v)
  ).getOrDie('Could not find the descendant ".me" or the first child of the descendant ".child"');

const run = function (input: string, f: (e: Element) => void) {
  const body = SelectorFind.first('body').getOrDie();
  const container = Element.fromTag('div');
  Insert.append(body, container);
  container.dom().innerHTML = input;
  const node: Element<DomNode> = getNode(container);
  f(node);
  Remove.remove(container);
};

export {
  run
};
