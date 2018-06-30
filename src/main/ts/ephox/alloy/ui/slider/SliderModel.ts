import { Option, Fun } from "@ephox/katamari";
import { ClientRect } from '@ephox/dom-globals';
import { AlloyComponent } from "ephox/alloy/api/component/ComponentApi";
import { SliderDetail } from "ephox/alloy/ui/types/SliderTypes";

export interface ValueOfArgs {
  bounds: () => ClientRect,
  min:  () => number,
  max:  () => number,
  value:  () => number,
  step:  () => number,
  snap:  () => boolean,
  snapStart:  () => Option<number>,
  rounded:  () => boolean,
  minEdge:  () => boolean,
  maxEdge:  () => boolean,
  getMinBound:  (bounds: ClientRect, property: string) => string,
  getMaxBound:  (bounds: ClientRect, property: string) => string,
  lengthProp:  (detail: SliderDetail) => string
};

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

const findOffsetOf = (bounds: ClientRect, value: number, minEdgeProp: string, maxEdgeProp: string): number => {
  return Math.min(bounds[maxEdgeProp], Math.max(value, bounds[minEdgeProp])) - bounds[minEdgeProp];
};

const boundsEdge = (bounds: ClientRect, property: string): number => {
  return bounds[property];
};

const findValueOf = (args: ValueOfArgs): number => {
  const bounds = args.bounds(detail);
    min = args.min(),
    max = args.max(), 
    value = args.value(),
    step = args.step(),
    snap = args.snap(),
    snapStart = args.(),
    rounded = args.(),
    minEdge = args.(),
    hasMaxEdge = args.(),
    getMinEdge = args.(),
    getMaxEdge = args.(),
    lengthProp
  const {
    bounds(): bounds,
    
  } = args;
  const range = max - min;
  const capMin = hasMinEdge ? min - 1 : min;
  const capMax = hasMaxEdge ? max + 1 : max;

  if (value < bounds[minEdgeProp]) {
    return capMin;
  } else if (value > bounds[maxEdgeProp]) { 
    return capMax;
  } else {
    const offset = findOffsetOf(bounds, value, minEdgeProp, maxEdgeProp);
    const newValue = capValue(((offset / bounds[lengthProp]) * range) + min, capMin, capMax);
    if (snapToGrid && newValue >= min && newValue <= max) {
      return snapValueOf(newValue, min, max, step, snapStart);
    } else if (rounded) {
      return Math.round(newValue);
    } else {
      return newValue;
    }
  }
};

const findValueOfX = (bounds: ClientRect, min: number, max: number, xValue: number, step: number, snapToGrid: boolean, snapStart: Option<number>, rounded: boolean, hasMinEdge: boolean, hasMaxEdge: boolean): number => {
  return findValueOf(bounds, min, max, xValue, step, snapToGrid, snapStart, rounded, hasMinEdge, hasMaxEdge, 'left', 'right', 'width');
};

const findValueOfY = (bounds: ClientRect, min: number, max: number, yValue: number, step: number, snapToGrid: boolean, snapStart: Option<number>, rounded: boolean, hasMinEdge: boolean, hasMaxEdge: boolean): number => {
  return findValueOf(bounds, min, max, yValue, step, snapToGrid, snapStart, rounded, hasMinEdge, hasMaxEdge, 'top', 'bottom', 'height');
};

const halfOf = (bounds: ClientRect, minEdgeProperty: string, maxEdgeProperty: string): number => {
  return (bounds[maxEdgeProperty] - bounds[minEdgeProperty]) / 2
};

const centerOf = (bounds: ClientRect, minEdgeProperty: string, maxEdgeProperty: string): number => {
  return (bounds[minEdgeProperty] + bounds[maxEdgeProperty]) / 2;
};

const centerY = (bounds: ClientRect): number => {
  return centerOf(bounds, 'top', 'bottom');
};

const centerX = (bounds: ClientRect): number => {
  return centerOf(bounds, 'left', 'right');
};

const findOffsetOfValue = (bounds: ClientRect, min: () => number, max: () => number, value: () => number, centre: () => number, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>, edgeProperty: string, lengthProperty:string): number => {
  const range = max - min;
  if (value < min) {
    return minEdge.fold(() => 0, 
      (edge) => {
        const edgeBounds = edge.element().dom().getBoundingClientRect();
        return getCentre(edgeBounds) - bounds[edgeProperty]
      });
  } else if (value > max) {
    return maxEdge.fold(() => bounds[edgeProperty],
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
  centerX,
  centerY,
  boundsEdge,
  findOffsetOfValue
};