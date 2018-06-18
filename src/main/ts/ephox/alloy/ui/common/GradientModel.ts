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

const snapValueOf = function (bounds, value, min, max, step, snapStart) {
  // We are snapping by the step size. Therefore, find the nearest multiple of
  // the step
  return snapStart.fold(function () {
    // There is no initial snapping start, so just go from the minimum
    const initValue = value - min;
    const extraValue = Math.round(initValue / step) * step;
    return capValue(min + extraValue, min - 1, max + 1);
  }, function (start) {
    // There is an initial snapping start, so using that as the starting point,
    // calculate the nearest snap position based on the value
    const remainder = (value - start) % step;
    const adjustment = Math.round(remainder / step);

    const rawSteps = Math.floor((value - start) / step);
    const maxSteps = Math.floor((max - start) / step);

    const numSteps = Math.min(maxSteps, rawSteps + adjustment);
    const r = start + (numSteps * step);
    return Math.max(start, r);
  });
};

const findValueOf = function (bounds, min, max, value, step, snapToGrid, snapStart, ledgeProp, redgeProp, lengthProp) {
  const range = max - min;
  // TODO: TM-26 Make this bounding of edges work only occur if there are edges (and work with snapping)
  if (value < bounds[ledgeProp]) { 
    return min - 1; 
  } else if (value > bounds[redgeProp]) { 
    return max + 1; 
  } else {
    const offset = Math.min(bounds[redgeProp], Math.max(value, bounds[ledgeProp])) - bounds[ledgeProp];
    const newValue = capValue(((offset / bounds[lengthProp]) * range) + min, min - 1, max + 1);
    const roundedValue = Math.round(newValue);
    return snapToGrid && newValue >= min && newValue <= max ? snapValueOf(bounds, newValue, min, max, step, snapStart) : roundedValue;
  }
};

const findValueOfX = function (bounds, min, max, xValue, step, snapToGrid, snapStart) {
  return findValueOf(bounds, min, max, xValue, step, snapToGrid, snapStart, 'left', 'right', 'width');
};

const findValueOfY = function (bounds, min, max, yValue, step, snapToGrid, snapStart) {
  return findValueOf(bounds, min, max, yValue, step, snapToGrid, snapStart, 'top', 'bottom', 'height');
};

const findUnroundedOf = function (bounds, value, ledgeProp, redgeProp) {
  if (value < bounds[ledgeProp]) {
    return 0;
  } else if (value > bounds[redgeProp]) {
    return bounds[redgeProp] - bounds[ledgeProp];
  } else {
    const offset = Math.min(bounds[redgeProp], Math.max(value, bounds[ledgeProp])) - bounds[ledgeProp];
    return offset;
  }
};

const findPercentageValueOfCoords = function (bounds, coords) {
  const x = findUnroundedOf(bounds, coords.x, 'left', 'right');
  const y = findUnroundedOf(bounds, coords.y, 'top', 'bottom');
  return {
    x,
    y,
    percentX: x / bounds.width * 100,
    percentY: y / bounds.height * 100
  };
};

export {
  reduceBy,
  increaseBy,
  findValueOfX,
  findValueOfY,
  findPercentageValueOfCoords
};