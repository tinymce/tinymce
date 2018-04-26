const reduceBy = function (value, min, max, step) {
  if (value < min) {
    return value;
  } else if (value > max) {
      return max;
  } else if (value === min) {
      return min - 1;
  } else {
      return Math.max(min, value - step);
  }
};

const increaseBy = function (value, min, max, step) {
  if (value > max) {
    return value;
  } else if (value < min) {
      return min;
  } else if (value === max) {
      return max + 1;
  } else {
      return Math.min(max, value + step);
  }
};

const capValue = function (value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
};

const findValueOf = function (bounds, min, max, value, step, ledgeProp, redgeProp, lengthProp) {
  const range = max - min;
  // TODO: TM-26 Make this bounding of edges work only occur if there are edges (and work with snapping)
  if (value < bounds[ledgeProp]) { return min - 1; } else if (value > bounds[redgeProp]) { return max + 1; } else {
    const offset = Math.min(bounds[redgeProp], Math.max(value, bounds[ledgeProp])) - bounds[ledgeProp];
    const newValue = capValue(((offset / bounds[lengthProp]) * range) + min, min - 1, max + 1);
    const roundedValue = Math.round(newValue);
    return roundedValue;
  }
};

const findValueOfX = function (bounds, min, max, xValue, step) {
  return findValueOf(bounds, min, max, xValue, step, 'left', 'right', 'width');
};

const findValueOfY = function (bounds, min, max, xValue, step) {
  return findValueOf(bounds, min, max, xValue, step, 'top', 'bottom', 'height');
};

const findValueOfCoords = function (bounds, min, max, coords, step) {
  return {
    x: findValueOfX(bounds, min, max, coords.x, step),
    y: findValueOfY(bounds, min, max, coords.y, step),
  };
};

export {
  reduceBy,
  increaseBy,
  findValueOfX,
  findValueOfY,
  findValueOfCoords
};