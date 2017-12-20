import Compare from '../dom/Compare';
import Awareness from './Awareness';
import CursorPosition from './CursorPosition';

var isAtEdge = function (parent, current, currentOffset, descent, awareness) {
  return descent(parent).fold(function () {
    return true;
  }, function (element) {
    return Compare.eq(current, element) && awareness(current, currentOffset);
  });
};

var isLeft = function (parent, selection) {
  return isAtEdge(parent, selection.startContainer(), selection.startOffset(), CursorPosition.first, Awareness.isStart);
};

// This is doing exactly the same thing as the above isLeft method, checking to see if an element/offset selection endpoint is at the left edge of its parent
// after ascending up to that parent except we explicitly provide the element and its offset instead of just using the selection object.
var isAtLeftEdge = function (parent, element, offset) {
  return isAtEdge(parent, element, offset, CursorPosition.first, Awareness.isStart);
};

var isRight = function (parent, selection) {
  return isAtEdge(parent, selection.startContainer(), selection.startOffset(), CursorPosition.last, Awareness.isEnd);
};

// This is doing exactly the same thing as the above isRight method, checking to see if an element/offset selection endpoint is at the right edge of its parent
// after ascending up to that parent except we explicitly provide the element and its offset instead of just using the selection object.
var isAtRightEdge = function (parent, element, offset) {
  return isAtEdge(parent, element, offset, CursorPosition.last, Awareness.isEnd);
};

export default <any> {
  isLeft: isLeft,
  isAtLeftEdge: isAtLeftEdge,
  isRight: isRight,
  isAtRightEdge: isAtRightEdge
};