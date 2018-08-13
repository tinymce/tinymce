import { Option } from '@ephox/katamari';

export interface ValueOfArgs {
  min: number;
  max: number;
  range: number;
  value: number;
  step: number;
  snap: boolean;
  snapStart: Option<number>;
  rounded: boolean;
  hasMinEdge: boolean;
  hasMaxEdge: boolean;
  minBound: number;
  maxBound: number;
  screenRange: number;
}

export interface OffsetOfArgs {
  min: number;
  max: number;
  range: number;
  value: number;
  hasMinEdge: boolean;
  hasMaxEdge: boolean;
  minBound: number;
  minOffset: number;
  maxBound: number;
  maxOffset: number;
  centerMinEdge: number;
  centerMaxEdge: number;
}

const reduceBy = (value: number, min: number, max: number, step: number): number => {
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

const increaseBy = (value: number, min: number, max: number, step: number): number => {
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

const capValue = (value: number, min: number, max: number): number => {
  return Math.max(
    min,
    Math.min(max, value)
  );
};

const snapValueOf = (value: number, min: number, max: number, step: number, snapStart: Option<number>): number => {
  // We are snapping by the step size. Therefore, find the nearest multiple of
  // the step
  return snapStart.fold(() => {
    // There is no initial snapping start, so just go from the minimum
    const initValue = value - min;
    const extraValue = Math.round(initValue / step) * step;
    return capValue(min + extraValue, min - 1, max + 1);
  }, (start) => {
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

const findOffsetOf = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(value, min)) - min;
};

const findValueOf = (args: ValueOfArgs): number => {
  const { min, max, range, value, step, snap, snapStart, rounded, hasMinEdge, hasMaxEdge, minBound, maxBound, screenRange } = args;

  const capMin = hasMinEdge ? min - 1 : min;
  const capMax = hasMaxEdge ? max + 1 : max;

  if (value < minBound) {
    return capMin;
  } else if (value > maxBound) {
    return capMax;
  } else {
    const offset = findOffsetOf(value, minBound, maxBound);
    const newValue = capValue(((offset / screenRange) * range) + min, capMin, capMax);
    if (snap && newValue >= min && newValue <= max) {
      return snapValueOf(newValue, min, max, step, snapStart);
    } else if (rounded) {
      return Math.round(newValue);
    } else {
      return newValue;
    }
  }
};

const findOffsetOfValue = (args: OffsetOfArgs): number => {
  const { min, max, range, value, hasMinEdge, hasMaxEdge, maxBound, maxOffset, centerMinEdge, centerMaxEdge } = args;

  if (value < min) {
    return hasMinEdge ? 0 : centerMinEdge;
  } else if (value > max) {
    return hasMaxEdge ? maxBound : centerMaxEdge;
  } else {
    // position along the slider
    return (value - min) / range * maxOffset;
  }
};

export {
  reduceBy,
  increaseBy,
  findValueOf,
  findOffsetOfValue
};