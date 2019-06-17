import { Option } from '@ephox/katamari';

import { SliderDetail } from '../../ui/types/SliderTypes';

const t = 'top',
      r = 'right',
      b = 'bottom',
      l = 'left';

// Values
const minX = (detail: SliderDetail): number => detail.model.minX;
const minY = (detail: SliderDetail): number => detail.model.minY;

const min1X = (detail: SliderDetail): number => detail.model.minX - 1;
const min1Y = (detail: SliderDetail): number => detail.model.minY - 1;

const maxX = (detail: SliderDetail): number => detail.model.maxX;
const maxY = (detail: SliderDetail): number => detail.model.maxY;

const max1X = (detail: SliderDetail): number => detail.model.maxX + 1;
const max1Y = (detail: SliderDetail): number => detail.model.maxY + 1;

const range = (detail: SliderDetail, max: (detail: SliderDetail) => number, min: (detail: SliderDetail) => number): number => max(detail) - min(detail);

const xRange = (detail: SliderDetail): number => range(detail, maxX, minX);
const yRange = (detail: SliderDetail): number => range(detail, maxY, minY);

const halfX = (detail: SliderDetail): number => xRange(detail) / 2;
const halfY = (detail: SliderDetail): number => yRange(detail) / 2;

const step = (detail: SliderDetail): number => detail.stepSize;
const snap = (detail: SliderDetail): boolean => detail.snapToGrid;
const snapStart = (detail: SliderDetail): Option<number> => detail.snapStart;
const rounded = (detail: SliderDetail): boolean => detail.rounded;

// Not great but... /shrug
const hasEdge = (detail: SliderDetail, edgeName: string): boolean => detail[edgeName + '-edge'] !== undefined;

const hasLEdge = (detail: SliderDetail): boolean => hasEdge(detail, l);
const hasREdge = (detail: SliderDetail): boolean => hasEdge(detail, r);

const hasTEdge = (detail: SliderDetail): boolean => hasEdge(detail, t);
const hasBEdge = (detail: SliderDetail): boolean => hasEdge(detail, b);

// Ew, any
const currentValue = (detail: SliderDetail): any => detail.model.value.get();

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