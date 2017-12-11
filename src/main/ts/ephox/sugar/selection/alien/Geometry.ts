var searchForPoint = function (rectForOffset, x, y, maxX, length) {
  // easy cases
  if (length === 0) return 0;
  else if (x === maxX) return length - 1;

  var xDelta = maxX;

  // start at 1, zero is the fallback
  for (var i = 1; i < length; i++) {
    var rect = rectForOffset(i);
    var curDeltaX = Math.abs(x - rect.left);

    if (y > rect.bottom) {
      // range is too high, above drop point, do nothing
    } else if (y < rect.top || curDeltaX > xDelta) {
      // if the search winds up on the line below the drop point,
      // or we pass the best X offset,
      // wind back to the previous (best) delta
      return i - 1;
    } else {
      // update current search delta
      xDelta = curDeltaX;
    }
  }
  return 0; // always return something, even if it's not the exact offset it'll be better than nothing
};

var inRect = function (rect, x, y) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
};

export default <any> {
  inRect: inRect,
  searchForPoint: searchForPoint
};