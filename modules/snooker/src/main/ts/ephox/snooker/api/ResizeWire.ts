import { Fun, Optional } from '@ephox/katamari';
import { SugarElement, SugarLocation, SugarPosition } from '@ephox/sugar';

// parent: the container where the resize bars are appended
//         this gets mouse event handlers only if it is not a child of 'view' (eg, detached/inline mode)
// view: the container who listens to mouse events from content tables (eg, detached/inline mode)
//       or the document that is a common ancestor of both the content tables and the
//       resize bars ('parent') and so will listen to events from both (eg, iframe mode)
// origin: the offset for the point to display the bars in the appropriate position
// isResizable: a callback that determines if the provided element can be resized using the resize bars

type ResizeCallback = (elm: SugarElement<Element>) => boolean;

export interface ResizeWire {
  parent: () => SugarElement;
  view: () => SugarElement;
  origin: () => SugarPosition;
  isResizable: ResizeCallback;
}

const only = function (element: SugarElement, isResizable: ResizeCallback): ResizeWire {
  // If element is a 'document', use the document element ('HTML' tag) for appending.
  const parent = Optional.from(element.dom.documentElement).map(SugarElement.fromDom).getOr(element);
  return {
    parent: Fun.constant(parent),
    view: Fun.constant(element),
    origin: Fun.constant(SugarPosition(0, 0)),
    isResizable
  };
};

const detached = function (editable: SugarElement, chrome: SugarElement, isResizable: ResizeCallback): ResizeWire {
  const origin = () => SugarLocation.absolute(chrome);
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin,
    isResizable
  };
};

const body = function (editable: SugarElement, chrome: SugarElement, isResizable: ResizeCallback): ResizeWire {
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin: Fun.constant(SugarPosition(0, 0)),
    isResizable
  };
};

export const ResizeWire = {
  only,
  detached,
  body
};
