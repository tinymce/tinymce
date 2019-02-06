import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Location } from '@ephox/sugar';
import { Position } from '@ephox/sugar';

// parent: the container where the resize bars are appended
//         this gets mouse event handlers only if it is not a child of 'view' (eg, detached/inline mode)
// view: the container who listens to mouse events from content tables (eg, detached/inline mode)
//       or the document that is a common ancestor of both the content tables and the
//       resize bars ('parent') and so will listen to events from both (eg, iframe mode)
// origin: the offset for the point to display the bars in the appropriate position

var only = function (element) {
  // If element is a 'document', use the document element ('HTML' tag) for appending.
  var parent = Option.from(element.dom().documentElement).map(Element.fromDom).getOr(element);
  return {
    parent: Fun.constant(parent),
    view: Fun.constant(element),
    origin: Fun.constant(Position(0, 0))
  };
};

var detached = function (editable, chrome) {
  var origin = Fun.curry(Location.absolute, chrome);
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin: origin
  };
};

var body = function (editable, chrome) {
  return {
    parent: Fun.constant(chrome),
    view: Fun.constant(editable),
    origin: Fun.constant(Position(0, 0))
  };
};

export default {
  only: only,
  detached: detached,
  body: body
};