define(
  'ephox.porkbun.Event',

  [
    'ephox.wrap.D'
  ],

  function (D) {
    var create = function (source, events) {
      var registry = {};
      var trigger = {};

      D(events).each(function (event) {
        var callbacks = [];

        var bind = function (callback) {
          if (callback === undefined) {
            throw 'Event bind error: undefined callback bound for "' + event + '" event';
          }
          callbacks.push(callback);
        };

        var unbind = function (callback) {
          if (callback !== undefined) {
            var index = callbacks.indexOf(callback);
            if (index !== -1) {
              callbacks.splice(index, 1);
            }
          } else {
            callbacks = [];
          }
        };

        registry[event] = {
          bind: bind,
          unbind: unbind
        };

        trigger[event] = function (extra) {
          D(callbacks).each(function (callback) {
            callback(source, extra);
          });
        };
      });

      return {
        registry: registry,
        trigger: trigger
      }
    };

    return {
      create: create
    };
  }
);
