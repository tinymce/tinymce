define(
  'ephox.porkbun.Event',

  [
    'ephox.compass.Arr',
    'ephox.scullion.Struct'
  ],
  function (Arr, Struct) {

    var handlerSet = function () {

      var handlers = [];

      var add = function (handler) {
        handlers.push(handler);
      };

      var remove = function (handler) {
        var index = Arr.indexOf(handlers, handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      };

      var isEmpty = function () {
        return handlers.length === 0;
      };

      return {
        add: add,
        remove: remove,
        isEmpty: isEmpty
      };
    };

    var simple = function (name, struct) {

      var handlers = handlerSet();

      var bind = function (handler) {
        if (handler === undefined) {
          throw 'Event bind error: undefined handler bound for event type "' + name + '"';
        }
        handlers.add(handler);
      };

      var unbind = handlers.remove;

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

      var getHandlers = function() {
        return handlers;
      };

      var hasHandlers = function() {
        return !handlers.isEmpty();
      };

      return {
        name: name,
        bind: bind,
        unbind: unbind,
        trigger: trigger,
        hasHandlers: hasHandlers
      };
    };

    var delegating = function (name, fields, delegateRegistry, delegateName) {
      var mine = simple(name, fields);

      var bindDelegate = function () {
        delegateRegistry[delegateName].bind(mine.trigger);
      };

      var unbindDelegate = function () {
        delegateRegistry[delegateName].unbine(mine.trigger);
      };

      var bind = function (handler) {
        if (!mine.hasHandlers()) {
          bindDelegate();
        }
        mine.bind(handler);
      };

      var unbind = function (handler) {
        mine.unbind(handler);
        if (!mine.hasHandlers()) {
          unbindDelegate();
        }
      };
    };

    return {
      simple: simple,
      delegating: delegating
    };
  }
);
