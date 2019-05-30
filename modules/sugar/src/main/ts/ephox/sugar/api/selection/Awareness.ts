import { Arr } from '@ephox/katamari';
import * as Node from '../node/Node';
import * as Text from '../node/Text';
import * as Traverse from '../search/Traverse';
import Element from '../node/Element';

const getEnd = function (element: Element) {
  return Node.name(element) === 'img' ? 1 : Text.getOption(element).fold(function () {
    return Traverse.children(element).length;
  }, function (v) {
    return v.length;
  });
};

const isEnd = function (element: Element, offset: number) {
  return getEnd(element) === offset;
};

const isStart = function (element: Element, offset: number) {
  return offset === 0;
};

const NBSP = '\u00A0';

const isTextNodeWithCursorPosition = function (el: Element) {
  return Text.getOption(el).filter(function (text) {
    // For the purposes of finding cursor positions only allow text nodes with content,
    // but trim removes &nbsp; and that's allowed
    return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
  }).isSome();
};

const elementsWithCursorPosition = [ 'img', 'br' ];
const isCursorPosition = function (elem: Element) {
  const hasCursorPosition = isTextNodeWithCursorPosition(elem);
  return hasCursorPosition || Arr.contains(elementsWithCursorPosition, Node.name(elem));
};

export {
  getEnd,
  isEnd,
  isStart,
  isCursorPosition,
};