import { Fun, Optional } from '@ephox/katamari';
import { SugarElement, SugarLocation, SugarPosition } from '@ephox/sugar';

// parent: the container where the resize bars are appended
//         this gets mouse event handlers only if it is not a child of 'view' (eg, detached/inline mode)
// view: the container who listens to mouse events from content tables (eg, detached/inline mode)
//       or the document that is a common ancestor of both the content tables and the
//       resize bars ('parent') and so will listen to events from both (eg, iframe mode)
// origin: the offset for the point to display the bars in the appropriate position

export interface ResizeWire {
  parent: () => SugarElement;
  view: () => SugarElement;
  origin: () => SugarPosition;
}

const only = function (element: SugarElement): ResizeWire {
  // If element is a 'document', use the document element ('HTML' tag) for appending.
  const parent = Optional.from(element.dom.documentElement).map(SugarElement.fromDom).getOr(element);
  return {
    parent: Fun.constant(parent),
    view: Fun.constant(element),
    origin: Fun.constant(SugarPosition(0, 0))
  };
};

const detached = function (editable: SugarElement, chrome: SugarElement): ResizeWire {
  const origin = () => SugarLocation.absolute(chrome);
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin
  };
};

const body = function (editable: SugarElement, chrome: SugarElement): ResizeWire {
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin: Fun.constant(SugarPosition(0, 0))
  };
};

export const ResizeWire = {
  only,
  detached,
  body
};
