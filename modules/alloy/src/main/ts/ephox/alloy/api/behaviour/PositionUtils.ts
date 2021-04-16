import { Arr, Optional } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import { LayoutLabels } from '../../positioning/layout/LayoutLabels';
import { RepositionDecision } from '../../positioning/view/Reposition';

const dataAttribute = 'data-alloy-context-toolbar-location';

const isElementTopAligned = (element: SugarElement<any>): boolean => {
  return Arr.contains([ LayoutLabels.north, LayoutLabels.northInner, LayoutLabels.northPinned ], getDataAttribute(element));
};

const isDecisionTopAligned = (decisionOpt: Optional<RepositionDecision>): boolean => {
  return decisionOpt.map((decision) => decision.label === LayoutLabels.north).getOr(false);
};

const isElementBottomAligned = (element: SugarElement<any>): boolean => {
  return Arr.contains([ LayoutLabels.south, LayoutLabels.southInner, LayoutLabels.southPinned ], getDataAttribute(element));
};

const isDecisionBottomAligned = (decisionOpt: Optional<RepositionDecision>): boolean => {
  return decisionOpt.map((decision) => decision.label === LayoutLabels.south).getOr(false);
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
