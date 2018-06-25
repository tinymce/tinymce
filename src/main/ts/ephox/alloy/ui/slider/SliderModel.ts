import { Option, Fun } from "@ephox/katamari";
import { ClientRect } from '@ephox/dom-globals';
import { AlloyComponent } from "ephox/alloy/api/component/ComponentApi";

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

const findValueOf = (bounds: ClientRect, min: number, max: number, value: number, step: number, snapToGrid: boolean, snapStart: Option<number>, rounded: boolean, hasLedge: boolean, hasRedge: boolean, ledgeProp: string, redgeProp: string, lengthProp: string): number => {
  const range = max - min;
  const capMin = hasLedge ? min - 1 : min;
  const capMax = hasRedge ? max + 1 : max;

  if (value < bounds[ledgeProp]) {
    return capMin;
  } else if (value > bounds[redgeProp]) { 
    return capMax;
  } else {
    const offset = findOffsetOf(bounds, value, ledgeProp, redgeProp);
    const newValue = capValue(((offset / bounds[lengthProp]) * range) + min, capMin, capMax);
    if (snapToGrid && newValue >= min && newValue <= max) {
      return snapValueOf(bounds, newValue, min, max, step, snapStart);
    } else if (rounded) {
      return Math.round(newValue);
    } else {
      return newValue;
    }
  }
};

const findValueOfX = (bounds: ClientRect, min: number, max: number, xValue: number, step: number, snapToGrid: boolean, snapStart: Option<number>, rounded: boolean, hasLedge: boolean, hasRedge: boolean): number => {
  return findValueOf(bounds, min, max, xValue, step, snapToGrid, snapStart, rounded, hasLedge, hasRedge, 'left', 'right', 'width');
};

const findValueOfY = (bounds: ClientRect, min: number, max: number, yValue: number, step: number, snapToGrid: boolean, snapStart: Option<number>, rounded: boolean, hasLedge: boolean, hasRedge: boolean): number => {
  return findValueOf(bounds, min, max, yValue, step, snapToGrid, snapStart, rounded, hasLedge, hasRedge, 'top', 'bottom', 'height');
};

const halfOf = (bounds: ClientRect, ledgeProperty: string, redgeProperty: string): number => {
  return (bounds[redgeProperty] - bounds[ledgeProperty]) / 2
};

const halfX = (bounds: ClientRect, min: number, max: number, step: number, snapToGrid: boolean, snapStart: Option<number>, rounded: boolean): number => {
  return findValueOf(bounds, min, max, halfOf(bounds, 'left', 'right') + bounds.left, step, snapToGrid, snapStart, rounded, false, false, 'left', 'right', 'width');
};

const halfY = (bounds: ClientRect, min: number, max: number, step: number, snapToGrid: boolean, snapStart: Option<number>, rounded: boolean): number => {
  return findValueOf(bounds, min, max, halfOf(bounds, 'top', 'bottom') + bounds.top, step, snapToGrid, snapStart, rounded, false, false, 'top', 'bottom', 'height');
};

const centerOf = (bounds: ClientRect, ledgeProperty: string, redgeProperty: string): number => {
  return (bounds[ledgeProperty] + bounds[redgeProperty]) / 2;
};

const centerY = (bounds: ClientRect): number => {
  return centerOf(bounds, 'top', 'bottom');
};

const centerX = (bounds: ClientRect): number => {
  return centerOf(bounds, 'left', 'right');
};

const findOffsetOfValue = (bounds: ClientRect, min: number, max: number, value: number, getCentre: (bounds: ClientRect) => number, ledge: Option<AlloyComponent>, redge: Option<AlloyComponent>, edgeProperty: string, lengthProperty:string): number => {
  const range = max - min;
  if (value < min) {
    return ledge.fold(() => 0, 
      (edge) => {
        const edgeBounds = edge.element().dom().getBoundingClientRect();
        return getCentre(edgeBounds) - bounds[edgeProperty]
      });
  } else if (value > max) {
    return redge.fold(() => bounds[edgeProperty],
      (edge) => {
        const edgeBounds = edge.element().dom().getBoundingClientRect();
        return getCentre(edgeBounds) - bounds[edgeProperty]
      });
  } else {
    // position along the slider
    return (value - min) / range * bounds[lengthProperty];
  }
};

export {
  reduceBy,
  increaseBy,
  findValueOfX,
  findValueOfY,
  halfX,
  halfY,
  halfOf,
  centerX,
  centerY,
  findOffsetOfValue
};