import { SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import CaretPosition from '../caret/CaretPosition';
import { needsToBeNbspLeft, needsToBeNbspRight } from '../keyboard/Nbsps';

const trimOrPadLeftRight = (dom: DOMUtils, rng: Range, html: string): string => {
  const root = SugarElement.fromDom(dom.getRoot());

  // Adjust the start if it needs to be an nbsp
  if (needsToBeNbspLeft(root, CaretPosition.fromRangeStart(rng))) {
    html = html.replace(/^ /, '&nbsp;');
  } else {
    html = html.replace(/^&nbsp;/, ' ');
  }

  // Adjust the end if it needs to be an nbsp
  if (needsToBeNbspRight(root, CaretPosition.fromRangeEnd(rng))) {
    html = html.replace(/(&nbsp;| )(<br( \/)>)?$/, '&nbsp;');
  } else {
    html = html.replace(/&nbsp;(<br( \/)?>)?$/, ' ');
  }

  return html;
};

export {
  trimOrPadLeftRight
};
