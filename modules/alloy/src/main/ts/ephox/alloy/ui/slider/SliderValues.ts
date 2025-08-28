import { Optional } from '@ephox/katamari';

import {
  HorizontalSliderDetail, SliderDetail, SliderValueX, SliderValueXY, SliderValueY, TwoDSliderDetail, VerticalSliderDetail
} from '../types/SliderTypes';

const t = 'top',
  r = 'right',
  b = 'bottom',
  l = 'left';

// Values
const minX = (detail: HorizontalSliderDetail): number => detail.model.minX;
const minY = (detail: VerticalSliderDetail): number => detail.model.minY;

const min1X = (detail: HorizontalSliderDetail): number => detail.model.minX - 1;
const min1Y = (detail: VerticalSliderDetail): number => detail.model.minY - 1;

const maxX = (detail: HorizontalSliderDetail): number => detail.model.maxX;
const maxY = (detail: VerticalSliderDetail): number => detail.model.maxY;

const max1X = (detail: HorizontalSliderDetail): number => detail.model.maxX + 1;
const max1Y = (detail: VerticalSliderDetail): number => detail.model.maxY + 1;

const range = <T extends SliderDetail>(detail: T, max: (detail: T) => number, min: (detail: T) => number): number => max(detail) - min(detail);

const xRange = (detail: HorizontalSliderDetail): number => range(detail, maxX, minX);
const yRange = (detail: VerticalSliderDetail): number => range(detail, maxY, minY);

const halfX = (detail: HorizontalSliderDetail): number => xRange(detail) / 2;
const halfY = (detail: VerticalSliderDetail): number => yRange(detail) / 2;

const step = (detail: SliderDetail, useMultiplier?: boolean): number => useMultiplier ? detail.stepSize * detail.speedMultiplier : detail.stepSize;
const snap = (detail: SliderDetail): boolean => detail.snapToGrid;
const snapStart = (detail: SliderDetail): Optional<number> => detail.snapStart;
const rounded = (detail: SliderDetail): boolean => detail.rounded;

// Not great but... /shrug
const hasEdge = (detail: SliderDetail, edgeName: string): boolean => (detail as any)[edgeName + '-edge'] !== undefined;

const hasLEdge = (detail: SliderDetail): boolean => hasEdge(detail, l);
const hasREdge = (detail: SliderDetail): boolean => hasEdge(detail, r);

const hasTEdge = (detail: SliderDetail): boolean => hasEdge(detail, t);
const hasBEdge = (detail: SliderDetail): boolean => hasEdge(detail, b);

// Ew, any
const currentValue: {
  (detail: TwoDSliderDetail): SliderValueXY;
  (detail: HorizontalSliderDetail): SliderValueX;
  (detail: VerticalSliderDetail): SliderValueY;
} = (detail: SliderDetail): any => detail.model.value.get();

export {
  minX,
  min1X,
  maxX,
  max1X,
  minY,
  min1Y,
  maxY,
  max1Y,
  step,
  snap,
  snapStart,
  rounded,
  hasLEdge,
  hasREdge,
  hasTEdge,
  hasBEdge,
  currentValue,
  xRange,
  yRange,
  halfX,
  halfY
};
