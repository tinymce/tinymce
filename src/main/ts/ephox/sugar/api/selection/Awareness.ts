import { Arr } from '@ephox/katamari';
import Node from '../node/Node';
import Text from '../node/Text';
import Traverse from '../search/Traverse';
import Element from '../node/Element';

var getEnd = function (element: Element) {
  return Node.name(element) === 'img' ? 1 : Text.getOption(element).fold(function () {
    return Traverse.children(element).length;
  }, function (v) {
    return v.length;
  });
};

var isEnd = function (element: Element, offset: number) {
  return getEnd(element) === offset;
};

var isStart = function (element: Element, offset: number) {
  return offset === 0;
};

var NBSP = '\u00A0';

var isTextNodeWithCursorPosition = function (el: Element) {
  return Text.getOption(el).filter(function (text) {
    // For the purposes of finding cursor positions only allow text nodes with content,
    // but trim removes &nbsp; and that's allowed
    return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
  }).isSome();
};

var elementsWithCursorPosition = [ 'img', 'br' ];
var isCursorPosition = function (elem: Element) {
  var hasCursorPosition = isTextNodeWithCursorPosition(elem);
  return hasCursorPosition || Arr.contains(elementsWithCursorPosition, Node.name(elem));
};

export default {
  getEnd,
  isEnd,
  isStart,
  isCursorPosition,
};