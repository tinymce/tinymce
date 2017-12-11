import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';

/**
 * Generate a PositionArray
 *
 * xs:     list of thing
 * f:      thing -> Optional unit
 * _start: sets the start position to search at
 */
var make = function (xs, f, _start) {

  var init = {
    len: _start !== undefined ? _start : 0,
    list: []
  };

  var r = Arr.foldl(xs, function (b, a) {
    var value = f(a, b.len);
    return value.fold(Fun.constant(b), function (v) {
      return {
        len: v.finish(),
        list: b.list.concat([v])
      };
    });
  }, init);

  return r.list;
};

export default <any> {
  make: make
};