import { Option, Fun } from "@ephox/katamari";
import { ClientRect } from '@ephox/dom-globals';
import { SugarPosition } from "ephox/alloy/alien/TypeDefinitions";

export interface PercentagePosition {
  left: () => number;
  top: () => number;
  percentLeft: () => number;
  percentTop: () => number;
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

const snapValueOf = (bounds: ClientRect, value: number, min: number, max: number, step: number, snapStart: Option<number>): number => {
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

const findOffsetOf = (bounds: ClientRect, value: number, ledgeProp: string, redgeProp: string): number => {
  return Math.min(bounds[redgeProp], Math.max(value, bounds[ledgeProp])) - bounds[ledgeProp];
};

const findValueOf = (bounds: ClientRect, min: number, max: number, value: number, step: number, snapToGrid: boolean, snapStart: Option<number>, ledgeProp: string, redgeProp: string, lengthProp: string): number => {
  const range = max - min;
  // TODO: TM-26 Make this bounding of edges work only occur if there are edges (and work with snapping)
  if (value < bounds[ledgeProp]) { 
    return min - 1; 
  } else if (value > bounds[redgeProp]) { 
    return max + 1; 
  } else {
    const offset = findOffsetOf(bounds, value, ledgeProp, redgeProp);
    const newValue = capValue(((offset / bounds[lengthProp]) * range) + min, min - 1, max + 1);
    const roundedValue = Math.round(newValue);
    return snapToGrid && newValue >= min && newValue <= max ? snapValueOf(bounds, newValue, min, max, step, snapStart) : roundedValue;
  }
};

const findValueOfX = (bounds: ClientRect, min: number, max: number, xValue: number, step: number, snapToGrid: boolean, snapStart: Option<number>): number => {
  return findValueOf(bounds, min, max, xValue, step, snapToGrid, snapStart, 'left', 'right', 'width');
};

const findValueOfY = (bounds: ClientRect, min: number, max: number, yValue: number, step: number, snapToGrid: boolean, snapStart: Option<number>): number => {
  return findValueOf(bounds, min, max, yValue, step, snapToGrid, snapStart, 'top', 'bottom', 'height');
};

const findUnroundedOf = (bounds: ClientRect, value: number, ledgeProp: string, redgeProp: string): number => {
  if (value < bounds[ledgeProp]) {
    return 0;
  } else if (value > bounds[redgeProp]) {
    return bounds[redgeProp] - bounds[ledgeProp];
  } else {
    return findOffsetOf(bounds, value, ledgeProp, redgeProp);
  }
};

const findPercentageValueOfCoords = (bounds: ClientRect, coords: SugarPosition): PercentagePosition => {
  const left = findUnroundedOf(bounds, coords.left(), 'left', 'right');
  const top = findUnroundedOf(bounds, coords.top(), 'top', 'bottom');
  const percentLeft = left / bounds.width * 100;
  const percentTop = top / bounds.height * 100;

  return {
    left: Fun.constant(left),
    top: Fun.constant(top),
    percentLeft: Fun.constant(percentLeft),
    percentTop: Fun.constant(percentTop)
  };
};

export {
  reduceBy,
  increaseBy,
  findValueOfX,
  findValueOfY,
  findPercentageValueOfCoords
};