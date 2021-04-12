import { Optional } from '@ephox/katamari';
import { Classes, SugarElement } from '@ephox/sugar';
import { north, northInner, northPinned, south, southInner, southPinned } from '../layout/LayoutLabels';
import { RepositionDecision } from './Reposition';

const isElementTopAligned = (element: SugarElement<any>): boolean => {
  return Classes.hasAny(element, [ north, northInner, northPinned ]);
};

const isDecisionTopAligned = (decisionOpt: Optional<RepositionDecision>): boolean => {
  return decisionOpt.map((decision) => {
    return decision.label === north;
  }).getOr(false);
};

const isElementBottomAligned = (element: SugarElement<any>): boolean => {
  return Classes.hasAny(element, [ south, southInner, southPinned ]);
};

const isDecisionBottomAligned = (decisionOpt: Optional<RepositionDecision>): boolean => {
  return decisionOpt.map((decision) => {
    return decision.label === south;
  }).getOr(false);
};

export {
  isElementTopAligned,
  isDecisionTopAligned,
  isElementBottomAligned,
  isDecisionBottomAligned
};