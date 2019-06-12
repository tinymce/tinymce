/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Element, Location, Position, Scroll } from '@ephox/sugar';

import * as Frames from './Frames';
import * as Navigation from './Navigation';

const find = (element: Element): Position => {
  const doc = Element.fromDom(document);
  const scroll = Scroll.get(doc);
  const frames = Frames.pathTo(element, Navigation);
  const offset = Location.viewport(element);

  const r = Arr.foldr(frames, (b, a) => {
    const loc = Location.viewport(a);
    return {
      left: b.left + loc.left(),
      top: b.top + loc.top()
    };
  }, { left: 0, top: 0 });

  return Position(r.left + offset.left() + scroll.left(), r.top + offset.top() + scroll.top());
};

export {
  find
};
