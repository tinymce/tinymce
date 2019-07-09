import { Arr, Option } from '@ephox/katamari';
import { Gene } from '../api/Gene';

const track = function (current: Gene, parent: Option<Gene>) {
  const r: Gene = {...current, parent };

  r.children = Arr.map(current.children || [], function (child) {
    // NOTE: The child must link to the new one being created (r)
    return track(child, Option.some(r));
  });

  return r;
};

export default {
  track
};
