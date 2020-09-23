import { Arr, Optional } from '@ephox/katamari';
import { Gene } from '../api/Gene';

const track = function (current: Gene, parent: Optional<Gene>) {
  const r: Gene = { ...current, parent };

  r.children = Arr.map(current.children || [], function (child) {
    // NOTE: The child must link to the new one being created (r)
    return track(child, Optional.some(r));
  });

  return r;
};

export {
  track
};
