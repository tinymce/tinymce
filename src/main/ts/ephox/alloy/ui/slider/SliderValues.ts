import { ClientRect } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { SliderDetail } from '../../ui/types/SliderTypes';

import * as SliderModel from './SliderModel';

const c = Fun.constant;

const minX = (detail: SliderDetail): () => number => c(detail.minX());
const minY = (detail: SliderDetail): () => number => c(detail.minY());

const min1X = (detail: SliderDetail): () => number => c(detail.minX() - 1);
const min1Y = (detail: SliderDetail): () => number => c(detail.minY() - 1);

const maxX = (detail: SliderDetail): () => number => c(detail.maxX());
const maxY = (detail: SliderDetail): () => number => c(detail.maxY());

const max1X = (detail: SliderDetail): () => number => c(detail.maxX() + 1);
const max1Y = (detail: SliderDetail): () => number => c(detail.maxY() + 1);

const range = (detail: SliderDetail): (max: () => number, min: () => number): number => {
  return max(detail) - min(detail);
};

const halfX = (detail: SliderDetail): () => number => c(range(detail)(detail.maxX, detail.minX) / 2);
const halfY = (detail: SliderDetail): () => number => c((detail.maxY() - detail.minY()) / 2);

const step = (detail: SliderDetail): () => number => c(detail.stepSize());
const snap = (detail: SliderDetail): () => boolean => c(detail.snapToGrid());
const snapStart = (detail: SliderDetail): () => Option<number> => c(detail.snapStart());
const rounded = (detail: SliderDetail): () => boolean => c(detail.rounded());

const currentX = (detail: SliderDetail): number => {
  return detail.value().get().x();
};
const currentY = (detail: SliderDetail): number => {
  return detail.value().get().x();
};
const getBounds = (component: AlloyComponent): () => ClientRect => {
  return () => component.element().dom().getBoundingClientRect();
};
const halfX = (edge: AlloyComponent, detail: SliderDetail): number => {
  const bounds = getBounds(edge);
  return SliderModel.halfX(bounds, minX(detail), maxX(detail), step(detail), snap(detail), snapStart, detail.rounded())
};
const halfY = (edge: AlloyComponent, detail: SliderDetail): number => {
  const bounds = getBounds(edge);
  return SliderModel.halfY(bounds, detail.minY(), detail.maxY(), detail.stepSize(), detail.snapToGrid(), detail.snapStart(), detail.rounded());
};

// Not great but... /shrug
const hasEdge = (detail: SliderDetail, edgeName: string): boolean => {
  return detail[edgeName + '-edge'] !== undefined;
}

const hasLedge = (detail: SliderDetail): boolean => hasEdge(detail, 'left');
const hasRedge = (detail: SliderDetail): boolean => hasEdge(detail, 'right');
const hasTedge = (detail: SliderDetail): boolean => hasEdge(detail, 'top');
const hasBedge = (detail: SliderDetail): boolean => hasEdge(detail, 'bottom');

const findX = (spectrum: AlloyComponent, detail: SliderDetail, value: number): number => {
  const bounds = getBounds(spectrum);
  const args = {
    bounds: getBounds,
    min: minX,
    max: maxX, 
    value,
    step, 
    snapToGrid, 
    snapStart, 
    rounded, 
    hasMinEdge, 
    hasMaxEdge, 
    minEdgeProp, 
    maxEdgeProp, 
    lengthProp
  };
  return SliderModel.findValueOfX(
    bounds, minX(detail), maxX(detail), value, step(detail),
    snap(detail), snapStart(detail), rounded(detail), hasLedge(detail), hasRedge
  );
};

export {
  minX,
  min1X,
  maxX,
  max1X,
  minY,
  min1Y,
  maxY,
  max1Y,
  currentX,
  currentY,
  halfX,
  halfY
}