import { Node as DomNode } from '@ephox/dom-globals';
import { Arr, Unicode } from '@ephox/katamari';
import Element from '../node/Element';
import * as Node from '../node/Node';
import * as Text from '../node/Text';
import * as Traverse from '../search/Traverse';

const getEnd = (element: Element<DomNode>) =>
  Node.name(element) === 'img' ? 1 : Text.getOption(element).fold(
    () => Traverse.children(element).length,
    (v) => v.length
  );

const isEnd = (element: Element<DomNode>, offset: number) => getEnd(element) === offset;

const isStart = (element: Element<DomNode>, offset: number) => offset === 0;

const isTextNodeWithCursorPosition = (el: Element<DomNode>) => Text.getOption(el).filter((text) =>
  // For the purposes of finding cursor positions only allow text nodes with content,
  // but trim removes &nbsp; and that's allowed
  text.trim().length !== 0 || text.indexOf(Unicode.nbsp) > -1
).isSome();

const elementsWithCursorPosition = [ 'img', 'br' ];
const isCursorPosition = (elem: Element<DomNode>) => {
  const hasCursorPosition = isTextNodeWithCursorPosition(elem);
  return hasCursorPosition || Arr.contains(elementsWithCursorPosition, Node.name(elem));
};

export {
  getEnd,
  isEnd,
  isStart,
  isCursorPosition
};
