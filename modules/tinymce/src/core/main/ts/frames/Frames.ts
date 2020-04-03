/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Navigation } from './Navigation';

const walkUp = (navigation: Navigation, doc: Element): Element[] => {
  const frame = navigation.view(doc);
  return frame.fold(Fun.constant([]), (f) => {
    const parent = navigation.owner(f);
    const rest = walkUp(navigation, parent);
    return [ f ].concat(rest);
  });
};

const pathTo = (element: Element, navigation: Navigation): Element[] => {
  const d = navigation.owner(element);
  return walkUp(navigation, d);
};

export {
  pathTo
};
