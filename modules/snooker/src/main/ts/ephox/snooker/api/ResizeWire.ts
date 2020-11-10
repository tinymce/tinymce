import { Fun, Optional } from '@ephox/katamari';
import { SugarElement, SugarLocation, SugarPosition } from '@ephox/sugar';

// parent: the container where the resize bars are appended
//         this gets mouse event handlers only if it is not a child of 'view' (eg, detached/inline mode)
// view: the container who listens to mouse events from content tables (eg, detached/inline mode)
//       or the document that is a common ancestor of both the content tables and the
//       resize bars ('parent') and so will listen to events from both (eg, iframe mode)
// origin: the offset for the point to display the bars in the appropriate position

type CanResizeCallback = (table: SugarElement<HTMLTableElement>, elm: SugarElement<Element>) => boolean;

export interface ResizeWire {
  parent: () => SugarElement;
  view: () => SugarElement;
  origin: () => SugarPosition;
  canResize: CanResizeCallback;
}


const only = function (element: SugarElement, canResize: CanResizeCallback): ResizeWire {
  // If element is a 'document', use the document element ('HTML' tag) for appending.
  const parent = Optional.from(element.dom.documentElement).map(SugarElement.fromDom).getOr(element);
  return {
    parent: Fun.constant(parent),
    view: Fun.constant(element),
    origin: Fun.constant(SugarPosition(0, 0)),
    canResize
  };
};

const detached = function (editable: SugarElement, chrome: SugarElement, canResize: CanResizeCallback): ResizeWire {
  const origin = () => SugarLocation.absolute(chrome);
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin,
    canResize
  };
};

const body = function (editable: SugarElement, chrome: SugarElement, canResize: CanResizeCallback): ResizeWire {
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin: Fun.constant(SugarPosition(0, 0)),
    canResize
  };
};

// TODO: attach callback to wire?

export const ResizeWire = {
  only,
  detached,
  body
};
