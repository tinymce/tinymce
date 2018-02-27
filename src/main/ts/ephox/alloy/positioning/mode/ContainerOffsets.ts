import { Option } from '@ephox/katamari';
import { Compare, Element, Location, Scroll, Traverse } from '@ephox/sugar';

import * as CssPosition from '../../alien/CssPosition';

// In one mode, the window is inside an iframe. If that iframe is in the
// same document as the positioning element (component), then identify the offset
// difference between the iframe and the component.
const getOffset = function (component, origin, anchorInfo) {
  const win = Traverse.defaultView(anchorInfo.root()).dom();

  const hasSameOwner = function (frame) {
    const frameOwner = Traverse.owner(frame);
    const compOwner = Traverse.owner(component.element());
    return Compare.eq(frameOwner, compOwner);
  };

  return Option.from(win.frameElement).map(Element.fromDom).
    filter(hasSameOwner).map(Location.absolute);
};

const getRootPoint = function (component, origin, anchorInfo) {
  const doc = Traverse.owner(component.element());
  const outerScroll = Scroll.get(doc);

  const offset = getOffset(component, origin, anchorInfo).getOr(outerScroll);
  return CssPosition.absolute(offset, outerScroll.left(), outerScroll.top());
};

export {
  getRootPoint
};