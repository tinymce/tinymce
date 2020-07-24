import { Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { Navigation } from './Navigation';

const walkUp = (navigation: Navigation, doc: SugarElement<HTMLDocument>): SugarElement[] => {
  const frame = navigation.view(doc);
  return frame.fold(Fun.constant([]), (f) => {
    const parent = navigation.owner(f);
    const rest = walkUp(navigation, parent);
    return [ f ].concat(rest);
  });
};

// TODO: Why is this an option if it is always some?
const pathTo = (element: SugarElement, navigation: Navigation): Optional<SugarElement[]> => {
  const d = navigation.owner(element);
  const paths = walkUp(navigation, d);
  return Optional.some(paths);
};

export {
  pathTo
};
