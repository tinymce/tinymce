import { Arr } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';



export default <any> function (fields) {
  var struct = Struct.immutable.apply(null, fields);

  var handlers = [];

  var bind = function (handler) {
    if (handler === undefined) {
      throw 'Event bind error: undefined handler';
    }
    handlers.push(handler);
  };

  var unbind = function(handler) {
    // This is quite a bit slower than handlers.splice() but we hate mutation.
    // Unbind isn't used very often so it should be ok.
    handlers = Arr.filter(handlers, function (h) {
      return h !== handler;
    });
  };

  var trigger = function (/* values */) {
    // scullion does Array prototype slice, we don't need to as well
    var event = struct.apply(null, arguments);
    Arr.each(handlers, function (handler) {
      handler(event);
    });
  };

  return {
    bind: bind,
    unbind: unbind,
    trigger: trigger
  };
};