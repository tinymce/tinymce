import { Fun } from '@ephox/katamari';
import { SugarElement, SugarLocation, SugarNode, SugarPosition, Traverse } from '@ephox/sugar';

// parent: the container where the resize bars are appended
//         this gets mouse event handlers only if it is not a child of 'view' (eg, detached/inline mode)
// view: the container who listens to mouse events from content tables (eg, detached/inline mode)
//       or the document that is a common ancestor of both the content tables and the
//       resize bars ('parent') and so will listen to events from both (eg, iframe mode)
// origin: the offset for the point to display the bars in the appropriate position
// isResizable: a callback that determines if the provided element can be resized using the resize bars

type ResizeCallback = (elm: SugarElement<Element>) => boolean;

export interface ResizeWire {
  parent: () => SugarElement<Node>;
  view: () => SugarElement<Node>;
  origin: () => SugarPosition;
  isResizable: ResizeCallback;
}

const only = (element: SugarElement<Document | Element>, isResizable: ResizeCallback): ResizeWire => {
  // If element is a 'document', use the document element ('HTML' tag) for appending.
  const parent = SugarNode.isDocument(element) ? Traverse.documentElement(element) : element;
  return {
    parent: Fun.constant(parent),
    view: Fun.constant(element),
    origin: Fun.constant(SugarPosition(0, 0)),
    isResizable
  };
};

const detached = (editable: SugarElement<Element>, chrome: SugarElement<Element>, isResizable: ResizeCallback): ResizeWire => {
  const origin = () => SugarLocation.absolute(chrome);
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin,
    isResizable
  };
};

const body = (editable: SugarElement<Element>, chrome: SugarElement<Element>, isResizable: ResizeCallback): ResizeWire => {
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
