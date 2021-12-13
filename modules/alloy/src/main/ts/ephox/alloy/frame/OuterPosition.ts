import { Arr, Fun } from '@ephox/katamari';
import { Scroll, SugarDocument, SugarElement, SugarLocation, SugarPosition } from '@ephox/sugar';

import * as Frames from './Frames';
import * as Navigation from './Navigation';

const find = (element: SugarElement<Element>): SugarPosition => {
  const doc = SugarDocument.getDocument();
  const scroll = Scroll.get(doc);

  // Get the path of iframe elements to this element.
  const path = Frames.pathTo(element, Navigation);

  return path.fold(Fun.curry(SugarLocation.absolute, element), (frames) => {
    const offset = SugarLocation.viewport(element);

    const r = Arr.foldr(frames, (b, a) => {
      const loc = SugarLocation.viewport(a);
      return {
        left: b.left + loc.left,
        top: b.top + loc.top
      };
    }, { left: 0, top: 0 });

    return SugarPosition(r.left + offset.left + scroll.left, r.top + offset.top + scroll.top);
  });
};

export {
  find
};
