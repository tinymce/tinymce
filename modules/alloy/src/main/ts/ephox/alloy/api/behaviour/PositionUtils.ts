import { Arr, Optional } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import { LayoutLabels } from '../../positioning/layout/LayoutLabels';
import { RepositionDecision } from '../../positioning/view/Reposition';

const isElementTopAligned = (element: SugarElement<any>): boolean => {
  const attribute = Attribute.get(element, 'data-alloy-context-toolbar-location');

  return Arr.contains([ LayoutLabels.north, LayoutLabels.northInner, LayoutLabels.northPinned ], attribute);
};

const isDecisionTopAligned = (decisionOpt: Optional<RepositionDecision>): boolean => {
  return decisionOpt.map((decision) => decision.label === LayoutLabels.north).getOr(false);
};

const isElementBottomAligned = (element: SugarElement<any>): boolean => {
  const attribute = Attribute.get(element, 'data-alloy-context-toolbar-location');

  return Arr.contains([ LayoutLabels.south, LayoutLabels.southInner, LayoutLabels.southPinned ], attribute);
};

const isDecisionBottomAligned = (decisionOpt: Optional<RepositionDecision>): boolean => {
  return decisionOpt.map((decision) => decision.label === LayoutLabels.south).getOr(false);
};

export {
  isElementTopAligned,
  isDecisionTopAligned,
  isElementBottomAligned,
  isDecisionBottomAligned
};
