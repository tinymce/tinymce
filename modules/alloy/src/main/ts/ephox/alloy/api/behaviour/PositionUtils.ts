import { Arr, Optional } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import { north, northInner, northPinned, south, southInner, southPinned } from '../../positioning/layout/LayoutLabels';
import { RepositionDecision } from '../../positioning/view/Reposition';

const isElementTopAligned = (element: SugarElement<any>): boolean => {
  const attribute = Attribute.get(element, 'data-mce-context-toolbar-location');

  return Arr.contains([ north, northInner, northPinned ], attribute);
};

const isDecisionTopAligned = (decisionOpt: Optional<RepositionDecision>): boolean => {
  return decisionOpt.map((decision) => decision.label === north).getOr(false);
};

const isElementBottomAligned = (element: SugarElement<any>): boolean => {
  const attribute = Attribute.get(element, 'data-mce-context-toolbar-location');

  return Arr.contains([ south, southInner, southPinned ], attribute);
};

const isDecisionBottomAligned = (decisionOpt: Optional<RepositionDecision>): boolean => {
  return decisionOpt.map((decision) => decision.label === south).getOr(false);
};

export {
  isElementTopAligned,
  isDecisionTopAligned,
  isElementBottomAligned,
  isDecisionBottomAligned
};