define(
  'ephox.porkbun.Events',

  [
    'ephox.wrap.D'
  ],

  function (D) {
    var create = function (names) {
      var registry = {};
      var trigger = {};

      D(names).each(function (name) {
        var callbacks = [];

        var bind = function (callback) {
          if (callback === undefined) {
            throw 'Event bind error: undefined callback bound for "' + name + '" event';
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

        registry[name] = {
          bind: bind,
          unbind: unbind
        };

        trigger[name] = function (event) {
          D(callbacks).each(function (callback) {
            callback(event);
          });
        };
      });

      return {
        registry: registry,
        trigger: trigger
      };
    };

    return {
      create: create
    };
  }
);
