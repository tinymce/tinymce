import { Element, Insert, Remove, SelectorFind, Traverse } from '@ephox/sugar';
import { Node as DomNode } from '@ephox/dom-globals';
import { Option, Options } from '@ephox/katamari';

const getNode = (container: Element): Element<DomNode> => {
  const dotme: Option<Element<DomNode>> = Options.vary(SelectorFind.descendant(container, '.me'));
  return dotme
    .orThunk(() => Options.vary(SelectorFind.descendant(container, '.child').bind(Traverse.firstChild)))
    .getOrDie('Could not find the descendant ".me" or the first child of the descendant ".child"');
};

const run = (input: string, f: (e: Element) => void): void => {
  const body = SelectorFind.first('body').getOrDie();
  const container = Element.fromTag('div');
  Insert.append(body, container);
  container.dom().innerHTML = input;
  const node = getNode(container);
  f(node);
  Remove.remove(container);
};

export {
  run
};
