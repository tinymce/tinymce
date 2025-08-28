const searchForPoint = (rectForOffset: (number: number) => (ClientRect | DOMRect), x: number, y: number, maxX: number, length: number): number => {
  // easy cases
  if (length === 0) {
    return 0;
  } else if (x === maxX) {
    return length - 1;
  }

  let xDelta = maxX;

  // start at 1, zero is the fallback
  for (let i = 1; i < length; i++) {
    const rect = rectForOffset(i);
    const curDeltaX = Math.abs(x - rect.left);

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

const inRect = (rect: ClientRect | DOMRect, x: number, y: number): boolean =>
  x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

export {
  inRect,
  searchForPoint
};
