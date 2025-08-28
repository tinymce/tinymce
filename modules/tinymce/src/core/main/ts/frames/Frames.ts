import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { Navigation } from './Navigation';

const walkUp = (navigation: Navigation, doc: SugarElement<Document>): SugarElement<Element>[] => {
  const frame = navigation.view(doc);
  return frame.fold(Fun.constant([]), (f) => {
    const parent = navigation.owner(f);
    const rest = walkUp(navigation, parent);
    return [ f ].concat(rest);
  });
};

const pathTo = (element: SugarElement<Node>, navigation: Navigation): SugarElement<Element>[] => {
  const d = navigation.owner(element);
  return walkUp(navigation, d);
};

export {
  pathTo
};
