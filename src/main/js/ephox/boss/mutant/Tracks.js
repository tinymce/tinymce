import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var track = function (current, parent) {
  var r = Merger.deepMerge(current, {
    parent: parent
  });

  r.children = Arr.map(current.children || [], function (child) {
    // NOTE: The child must link to the new one being created (r)
    return track(child, Option.some(r));
  });

  return r;
};

export default <any> {
  track: track
};