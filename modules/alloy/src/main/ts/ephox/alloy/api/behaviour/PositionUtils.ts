import { Arr, Optional } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import { LayoutLabels } from '../../positioning/layout/LayoutLabels';
import { RepositionDecision } from '../../positioning/view/Reposition';

const dataAttribute = 'data-alloy-positional-element-location';

const northValues = [ LayoutLabels.north, LayoutLabels.northInner, LayoutLabels.northPinned ];
const southValues = [ LayoutLabels.south, LayoutLabels.southInner, LayoutLabels.southPinned ];

const isElementTopAligned = (element: SugarElement<any>): boolean => {
  return Arr.contains(northValues, getDataAttribute(element));
};

const isDecisionTopAligned = (decisionOpt: Optional<RepositionDecision>): boolean => {
  return decisionOpt.map((decision) => {
    return Arr.contains(northValues, decision.label);
  }).getOr(false);
};

const isElementBottomAligned = (element: SugarElement<any>): boolean => {
  return Arr.contains(southValues, getDataAttribute(element));
};

const isDecisionBottomAligned = (decisionOpt: Optional<RepositionDecision>): boolean => {
  return decisionOpt.map((decision) => {
    return Arr.contains(southValues, decision.label);
  }).getOr(false);
};

const setDataAttribute = (element: SugarElement<any>, label: string): void => {
  Attribute.set(element, dataAttribute, label);
};

const getDataAttribute = (element: SugarElement<any>) => {
  return Attribute.get(element, dataAttribute);
};

export {
  isElementTopAligned,
  isDecisionTopAligned,
  isElementBottomAligned,
  isDecisionBottomAligned,
  setDataAttribute
};
