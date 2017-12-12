import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var walkUp = function (navigation, doc) {
  var frame = navigation.view(doc);
  return frame.fold(Fun.constant([]), function (f) {
    var parent = navigation.owner(f);
    var rest = walkUp(navigation, parent);
    return [f].concat(rest);
  });
};

var pathTo = function (element, navigation) {
  var d = navigation.owner(element);
  var paths = walkUp(navigation, d);
  return Option.some(paths);
};

export default <any> {
  pathTo: pathTo
};