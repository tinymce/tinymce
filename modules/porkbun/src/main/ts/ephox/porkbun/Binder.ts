import { Arr } from '@ephox/katamari';

var create = function() {
  var registrations = [];
  var handlers = [];

  var bind = function (registration, handler) {
    if (Arr.contains(registrations, registration)) {
      throw 'Invalid key, key already exists.';
    } else {
      registrations.push(registration);
      handlers.push(handler);
      registration.bind(handler);
    }
  };

  var unbind = function (registration) {
    var index = Arr.indexOf(registrations, registration);
    index.fold(function () {
      throw 'Invalid key, does not exist.';
    }, function (ind) {
      registrations.splice(ind, 1);
      var handler = handlers.splice(ind, 1)[0];
      registration.unbind(handler);
    });
  };

  var unbindAll = function () {
    Arr.each(registrations, function (registration, i) {
      var handler = handlers[i];
      registration.unbind(handler);
    });

    registrations.splice(0, registrations.length);
    handlers.splice(0, handlers.length);
  };

  return {
    bind: bind,
    unbind: unbind,
    unbindAll: unbindAll
  };
};

export default <any> {
  create: create
};