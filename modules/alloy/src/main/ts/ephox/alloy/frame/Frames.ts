import { HTMLDocument } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { Navigation } from './Navigation';

const walkUp = (navigation: Navigation, doc: Element<HTMLDocument>): Element[] => {
  const frame = navigation.view(doc);
  return frame.fold(Fun.constant([]), (f) => {
    const parent = navigation.owner(f);
    const rest = walkUp(navigation, parent);
    return [ f ].concat(rest);
  });
};

// TODO: Why is this an option if it is always some?
const pathTo = (element: Element, navigation: Navigation): Option<Element[]> => {
  const d = navigation.owner(element);
  const paths = walkUp(navigation, d);
  return Option.some(paths);
};

export {
  pathTo
};
