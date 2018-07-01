import { ClientRect } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { SliderDetail } from '../../ui/types/SliderTypes';

import * as SliderModel from './SliderModel';

const t = 'top',
      r = 'right',
      b = 'bottom',
      l = 'left',
      w = 'width',
      h = 'height';

// Values
const minX = (detail: SliderDetail): number => detail.minX();
const minY = (detail: SliderDetail): number => detail.minY();

const min1X = (detail: SliderDetail): number => detail.minX() - 1;
const min1Y = (detail: SliderDetail): number => detail.minY() - 1;

const maxX = (detail: SliderDetail): number => detail.maxX();
const maxY = (detail: SliderDetail): number => detail.maxY();

const max1X = (detail: SliderDetail): number => detail.maxX() + 1;
const max1Y = (detail: SliderDetail): number => detail.maxY() + 1;

const range = (detail: SliderDetail, max: (detail: SliderDetail) => number, min: (detail: SliderDetail) => number): number => max(detail) - min(detail);

const xRange = (detail: SliderDetail): number => range(detail, maxX, minX);
const yRange = (detail: SliderDetail): number => range(detail, maxY, minY);

const halfX = (detail: SliderDetail): number => xRange(detail) / 2;
const halfY = (detail: SliderDetail): number => yRange(detail) / 2;

const step = (detail: SliderDetail): number => detail.stepSize();
const snap = (detail: SliderDetail): boolean => detail.snapToGrid();
const snapStart = (detail: SliderDetail): Option<number> => detail.snapStart();
const rounded = (detail: SliderDetail): boolean => detail.rounded();

// Not great but... /shrug
const hasEdge = (detail: SliderDetail, edgeName: string): boolean => detail[edgeName + '-edge'] !== undefined;

const hasLedge = (detail: SliderDetail): boolean => hasEdge(detail, l);
const hasRedge = (detail: SliderDetail): boolean => hasEdge(detail, r);

const hasTedge = (detail: SliderDetail): boolean => hasEdge(detail, t);
const hasBedge = (detail: SliderDetail): boolean => hasEdge(detail, b);

const currentX = (detail: SliderDetail): number => detail.value().get().x();
const currentY = (detail: SliderDetail): number => detail.value().get().y();

const findX = (spectrum: AlloyComponent, detail: SliderDetail, value: number): number => {
  const args = {
    min: minX(detail),
    max: maxX(detail),
    range: xRange(detail),
    value: value,
    step: step(detail),
    snap: snap(detail),
    snapStart: snapStart(detail),
    rounded: rounded(detail),
    hasMinEdge: hasLedge(detail),
    hasMaxEdge: hasRedge(detail),
    minBound: getMinXBounds(spectrum),
    maxBound: getMaxXBounds(spectrum),
    screenRange: getXScreenRange(spectrum)
  };
  return SliderModel.findValueOf(args);
};

const findY = (spectrum: AlloyComponent, detail: SliderDetail, value: number): number => {
  const args = {
    min: minY(detail),
    max: maxY(detail),
    range: yRange(detail),
    value: value,
    step: step(detail),
    snap: snap(detail),
    snapStart: snapStart(detail),
    rounded: rounded(detail),
    hasMinEdge: hasTedge(detail),
    hasMaxEdge: hasBedge(detail),
    minBound: getMinYBounds(spectrum),
    maxBound: getMaxYBounds(spectrum),
    screenRange: getYScreenRange(spectrum)
  };
  return SliderModel.findValueOf(args);
};

// Offsets
const getBounds = (component: AlloyComponent): ClientRect => component.element().dom().getBoundingClientRect();
const getBoundsProperty = (bounds: ClientRect, property: string): number => bounds[property];

const getMinXBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, l);
};
const getMaxXBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, r);
};
const getMinYBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, t);
};
const getMaxYBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, b);
};
const getXScreenRange = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, w);
};
const getYScreenRange = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, h);
};

const getCenterOffsetOf = (componentMinEdge: number, componentMaxEdge: number, spectrumMinEdge: number): number => 
  (componentMinEdge + componentMaxEdge) / 2 - spectrumMinEdge;

const getXCenterOffSetOf = (component: AlloyComponent, spectrum: AlloyComponent): number => {
  const componentBounds = getBounds(component);
  const spectrumBounds = getBounds(spectrum);
  const componentMinEdge = getBoundsProperty(componentBounds, l);
  const componentMaxEdge = getBoundsProperty(componentBounds, r);
  const spectrumMinEdge = getBoundsProperty(spectrumBounds, l);
  return getCenterOffsetOf(componentMinEdge, componentMaxEdge, spectrumMinEdge);
};
const getYCenterOffSetOf = (component: AlloyComponent, spectrum: AlloyComponent): number => {
  const componentBounds = getBounds(component);
  const spectrumBounds = getBounds(spectrum);
  const componentMinEdge = getBoundsProperty(componentBounds, t);
  const componentMaxEdge = getBoundsProperty(componentBounds, b);
  const spectrumMinEdge = getBoundsProperty(spectrumBounds, t);
  return getCenterOffsetOf(componentMinEdge, componentMaxEdge, spectrumMinEdge);
};

const findXOffset = (spectrum: AlloyComponent, detail: SliderDetail, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>): number => {
  const minOffset = 0;
  const maxOffset = getXScreenRange(spectrum);
  const centerMinEdge = minEdge.bind((edge: AlloyComponent) => 
    Option.some(getXCenterOffSetOf(edge, spectrum))).getOr(minOffset);
  const centerMaxEdge = maxEdge.bind((edge: AlloyComponent) => 
    Option.some(getXCenterOffSetOf(edge, spectrum))).getOr(maxOffset);

  const args = {
    min: minX(detail),
    max: maxX(detail),
    range: xRange(detail),
    value: currentX(detail),
    hasMinEdge: hasLedge(detail),
    hasMaxEdge: hasRedge(detail),
    minBound: getMinXBounds(spectrum),
    minOffset,
    maxBound: getMaxXBounds(spectrum),
    maxOffset,
    centerMinEdge: centerMinEdge,
    centerMaxEdge: centerMaxEdge
  };
  return SliderModel.findOffsetOfValue(args);
};

const findYOffset = (spectrum: AlloyComponent, detail: SliderDetail, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>): number => {
  const minOffset = 0;
  const maxOffset = getYScreenRange(spectrum);
  const centerMinEdge = minEdge.bind((edge: AlloyComponent) => 
    Option.some(getYCenterOffSetOf(edge, spectrum))).getOr(minOffset);
  const centerMaxEdge = maxEdge.bind((edge: AlloyComponent) => 
    Option.some(getYCenterOffSetOf(edge, spectrum))).getOr(maxOffset);

  const args = {
    min: minY(detail),
    max: maxY(detail),
    range: yRange(detail),
    value: currentY(detail),
    hasMinEdge: hasLedge(detail),
    hasMaxEdge: hasRedge(detail),
    minBound: getMinYBounds(spectrum),
    minOffset,
    maxBound: getMaxYBounds(spectrum),
    maxOffset,
    centerMinEdge: centerMinEdge,
    centerMaxEdge: centerMaxEdge
  };
  return SliderModel.findOffsetOfValue(args);
};

const findXPos = (slider: AlloyComponent, spectrum: AlloyComponent, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>, detail: SliderDetail) => {
  const offset = findXOffset(spectrum, detail, minEdge, maxEdge);
  return (getMinXBounds(spectrum) - getMinXBounds(slider)) + offset;
};

const findYPos = (slider: AlloyComponent, spectrum: AlloyComponent, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>, detail: SliderDetail) => {
  const offset = findYOffset(spectrum, detail, minEdge, maxEdge);
  return (getMinYBounds(spectrum) - getMinYBounds(slider)) + offset;
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
  step,
  currentX,
  currentY,
  halfX,
  halfY,
  findX,
  findY,
  findXPos,
  findYPos
}