import { Arr, Unicode } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';
import * as SugarNode from '../node/SugarNode';
import * as SugarText from '../node/SugarText';
import * as Attribute from '../properties/Attribute';
import * as Traverse from '../search/Traverse';

const getEnd = (element: SugarElement<Node>): number =>
  SugarNode.name(element) === 'img' ? 1 : SugarText.getOption(element).fold(
    () => Traverse.children(element).length,
    (v) => v.length
  );

const isEnd = (element: SugarElement<Node>, offset: number): boolean => getEnd(element) === offset;

const isStart = (element: SugarElement<Node>, offset: number): boolean => offset === 0;

const isTextNodeWithCursorPosition = (el: SugarElement<Node>) => SugarText.getOption(el).filter((text) =>
  // For the purposes of finding cursor positions only allow text nodes with content,
  // but trim removes &nbsp; and that's allowed
  text.trim().length !== 0 || text.indexOf(Unicode.nbsp) > -1
).isSome();

const isContentEditableFalse = (elem: SugarElement<Node>) => SugarNode.isHTMLElement(elem) && (Attribute.get(elem, 'contenteditable') === 'false');

const elementsWithCursorPosition = [ 'img', 'br' ];
const isCursorPosition = (elem: SugarElement<Node>): boolean => {
  const hasCursorPosition = isTextNodeWithCursorPosition(elem);
  return hasCursorPosition || Arr.contains(elementsWithCursorPosition, SugarNode.name(elem)) || isContentEditableFalse(elem);
};

export {
  getEnd,
  isEnd,
  isStart,
  isCursorPosition
};
