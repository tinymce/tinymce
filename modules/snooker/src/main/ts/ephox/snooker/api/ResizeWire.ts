import { Fun, Option } from '@ephox/katamari';
import { Element, Location, Position } from '@ephox/sugar';

// parent: the container where the resize bars are appended
//         this gets mouse event handlers only if it is not a child of 'view' (eg, detached/inline mode)
// view: the container who listens to mouse events from content tables (eg, detached/inline mode)
//       or the document that is a common ancestor of both the content tables and the
//       resize bars ('parent') and so will listen to events from both (eg, iframe mode)
// origin: the offset for the point to display the bars in the appropriate position

export interface ResizeWire {
  parent: () => Element;
  view: () => Element;
  origin: () => Position;
}

const only = function (element: Element): ResizeWire {
  // If element is a 'document', use the document element ('HTML' tag) for appending.
  const parent = Option.from(element.dom().documentElement).map(Element.fromDom).getOr(element);
  return {
    parent: Fun.constant(parent),
    view: Fun.constant(element),
    origin: Fun.constant(Position(0, 0))
  };
};

const detached = function (editable: Element, chrome: Element): ResizeWire {
  const origin = Fun.curry(Location.absolute, chrome);
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin
  };
};

const body = function (editable: Element, chrome: Element): ResizeWire {
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin: Fun.constant(Position(0, 0))
  };
};

export const ResizeWire = {
  only,
  detached,
  body
};