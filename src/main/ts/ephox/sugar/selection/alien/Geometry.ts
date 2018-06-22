import { ClientRect, DOMRect } from "@ephox/dom-globals";

var searchForPoint = function (rectForOffset: (number) => (ClientRect | DOMRect), x: number, y: number, maxX: number, length: number) {
  // easy cases
  if (length === 0) return 0;
  else if (x === maxX) return length - 1;

  var xDelta = maxX;

  // start at 1, zero is the fallback
  for (var i = 1; i < length; i++) {
    var rect = rectForOffset(i);
    var curDeltaX = Math.abs(x - rect.left);

    // If Y is below drop point, do nothing
    if (y <= rect.bottom) {
      if (y < rect.top || curDeltaX > xDelta) {
        // if the search winds up on the line below the drop point,
        // or we pass the best X offset,
        // wind back to the previous (best) delta
        return i - 1;
      } else {
        // update current search delta
        xDelta = curDeltaX;
      }
    }
  }
  return 0; // always return something, even if it's not the exact offset it'll be better than nothing
};

var inRect = function (rect: ClientRect | DOMRect, x: number, y: number) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
};

export default {
  inRect,
  searchForPoint,
};