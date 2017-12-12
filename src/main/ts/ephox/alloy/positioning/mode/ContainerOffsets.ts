import CssPosition from '../../alien/CssPosition';
import { Option } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Location } from '@ephox/sugar';
import { Scroll } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

// In one mode, the window is inside an iframe. If that iframe is in the
// same document as the positioning element (component), then identify the offset
// difference between the iframe and the component.
var getOffset = function (component, origin, anchorInfo) {
  var win = Traverse.defaultView(anchorInfo.root()).dom();

  var hasSameOwner = function (frame) {
    var frameOwner = Traverse.owner(frame);
    var compOwner = Traverse.owner(component.element());
    return Compare.eq(frameOwner, compOwner);
  };

  return Option.from(win.frameElement).map(Element.fromDom).
    filter(hasSameOwner).map(Location.absolute);
};

var getRootPoint = function (component, origin, anchorInfo) {
  var doc = Traverse.owner(component.element());
  var outerScroll = Scroll.get(doc);

  var offset = getOffset(component, origin, anchorInfo).getOr(outerScroll);
  return CssPosition.absolute(offset, outerScroll.left(), outerScroll.top());
};

export default <any> {
  getRootPoint: getRootPoint
};