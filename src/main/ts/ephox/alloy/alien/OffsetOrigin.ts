import { Position } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Location } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

/*
 * This returns the position of the offset parent excluding any scroll. That
 * means that the absolute coordinates can be obtained by adding the origin
 * to the offset coordinates and not needing to know scroll.
 */
var getOrigin = function (element, scroll) {
  return Traverse.offsetParent(element).orThunk(function () {
    var marker = Element.fromTag('span');
    Insert.before(element, marker);
    var offsetParent = Traverse.offsetParent(marker);
    Remove.remove(marker);
    return offsetParent;
  }).map(function (offsetP) {
    var loc = Location.absolute(offsetP);
    return loc.translate(-scroll.left(), -scroll.top());
  }).getOrThunk(function () {
    return Position(0, 0);
  });
};

export default <any> {
  getOrigin: getOrigin
};