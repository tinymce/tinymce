define(
  'ephox.porkbun.Binder',

  [
    'ephox.wrap.D'
  ],

  function (D) {
    var create = function() {
      var types = [];
      var handlers = [];

      var newIndex = function(type) {
        var index = types.length;
        types.push(type);
        handlers.push([]);
        return index;
      };

      var safeIndexFor = function (type) {
        var index = types.indexOf(type);
        return index > -1 ? index : newIndex(type);

      };

      var bind = function(type, handler) {
        var index = safeIndexFor(type);
        handlers[index].push(handler);
        type.bind(handler);
      };

      var unbindAll = function(type) {
        var index = types.indexOf(type);

        if (index < 0) {
          throw "no listeners of type " + type;
        }

        // get handlers for type
        var typeHandlers = handlers[index];

        D(typeHandlers).each(function(handler) {
          type.unbind(handler);
        });
      };

      return {
        bind: bind,
        unbindAll: unbindAll
      };
    };

    return {
      create: create
    };
  }
);
