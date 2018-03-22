import { Arr, Fun } from '@ephox/katamari';
import { Element, Location, Position, Scroll } from '@ephox/sugar';

import * as Frames from './Frames';
import * as Navigation from './Navigation';

const find = function (element) {
  const doc = Element.fromDom(document);
  const scroll = Scroll.get(doc);
  const path = Frames.pathTo(element, Navigation);

  return path.fold(Fun.curry(Location.absolute, element), function (frames) {
    const offset = Location.viewport(element);

    const r = Arr.foldr(frames, function (b, a) {
      const loc = Location.viewport(a);
      return {
        left: b.left + loc.left(),
        top: b.top + loc.top()
      };
    }, { left: 0, top: 0 });

    return Position(r.left + offset.left() + scroll.left(), r.top + offset.top() + scroll.top());
  });
};

export {
  find
};