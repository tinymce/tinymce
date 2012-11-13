define(
  'ephox.porkbun.api.Event',

  [
    'ephox.compass.Arr',
    'ephox.scullion.Struct'
  ],
  function (Arr, Struct) {

    var arrayRemove = function (array) {
      return function(element) {
        var index = Arr.indexOf(array, element);
        if (index !== -1) {
          array.splice(index, 1);
        }
      };
    };

    var simple = function (name, struct) {

      var handlers = [];

      var bind = function (handler) {
        if (handler === undefined) {
          throw 'Event bind error: undefined handler bound for event type "' + name + '"';
        }
        handlers.push(handler);
      };

      var unbind = arrayRemove(handlers);

      var mkevent = function (fields) {
        try {
          return struct.apply(null, fields);
        } catch (e) {
          throw 'Unable to create struct for event type "' + name + '": ' + e;
        }
      };

      var trigger = function (/* fields */) {
        var fields = Array.prototype.slice.call(arguments);
        var event = mkevent(fields);
        Arr.each(handlers, function (handler) {
          handler(event);
        });
      };

      return {
        name: name,
        bind: bind,
        unbind: unbind,
        trigger: trigger
      };
    };

    var delegating = function (name, fields, delegateRegistry, delegateName) {
      var mine = simple(name, fields);
      var numHandlers = 0;

      var maybeBindDelegate = function () {
        delegateRegistry[delegateName].bind(mine.trigger);
        if (numHandlers === 1) {
          bindDelegate();
        }
      };

      var unbindDelegate = function () {
        delegateRegistry[delegateName].unbind(mine.trigger);
        if (numHandlers === 0) {
          unbindDelegate();
        }
      };

      var bind = function (handler) {
        mine.bind(handler);
        numHandlers++;
        maybeBindDelegate();
      };

      var unbind = function (handler) {
        mine.unbind(handler);
        numHandlers--;
        maybeUnbindDelegate();
      };
    };

    return {
      simple: simple,
      delegating: delegating
    };
  }
);
