import { Arr, Optional } from '@ephox/katamari';

import { Gene } from '../api/Gene';

const track = (current: Gene, parent: Optional<Gene>): Gene => {
  const r: Gene = { ...current, parent };

  r.children = Arr.map(current.children || [], (child) => {
    // NOTE: The child must link to the new one being created (r)
    return track(child, Optional.some(r));
  });

  return r;
};

export {
  track
};
