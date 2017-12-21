import Frames from './Frames';
import Navigation from './Navigation';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Location } from '@ephox/sugar';
import { Position } from '@ephox/sugar';
import { Scroll } from '@ephox/sugar';

var find = function (element) {
  var doc = Element.fromDom(document);
  var scroll = Scroll.get(doc);
  var path = Frames.pathTo(element, Navigation);

  return path.fold(Fun.curry(Location.absolute, element), function (frames) {
    var offset = Location.viewport(element);

    var r = Arr.foldr(frames, function (b, a) {
      var loc = Location.viewport(a);
      return {
        left: b.left + loc.left(),
        top: b.top + loc.top()
      };
    }, { left: 0, top: 0 });

    return Position(r.left + offset.left() + scroll.left(), r.top + offset.top() + scroll.top());
  });
};

export default <any> {
  find: find
};