import { Arr } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import * as LayoutLabels from '../../positioning/layout/LayoutLabels';

const dataAttribute = 'data-alloy-positional-element-location';

const northValues = [ LayoutLabels.north, LayoutLabels.northInner, LayoutLabels.northPinned ];
const southValues = [ LayoutLabels.south, LayoutLabels.southInner, LayoutLabels.southPinned ];

const isElementTopAligned = (element: SugarElement<any>): boolean => {
  return Arr.contains(northValues, getDataAttribute(element));
};

const isElementBottomAligned = (element: SugarElement<any>): boolean => {
  return Arr.contains(southValues, getDataAttribute(element));
};

const setDataAttribute = (element: SugarElement<any>, label: string): void => {
  Attribute.set(element, dataAttribute, label);
};

const getDataAttribute = (element: SugarElement<any>) => {
  return Attribute.get(element, dataAttribute);
};

export {
  isElementTopAligned,
  isElementBottomAligned,
  setDataAttribute
};
