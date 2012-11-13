define(
  'ephox.porkbun.SourceEvent',

  [
    'ephox.peanut.Fun',
    'ephox.porkbun.Event'
  ],

  function (Fun, Event) {

    /** An event sourced from another event.

      :: ([String], {bind: ..., unbind: ...}) -> SourceEvent
    */
    return function (fields, source) {
      var mine = Event(fields);
      var numHandlers = 0;

      var bind = function (handler) {
        mine.bind(handler);
        numHandlers++;
        if (numHandlers === 1) {
          source.bind(mine.trigger);
        }
      };

      var unbind = function (handler) {
        mine.unbind(handler);
        numHandlers--;
        if (numHandlers === 0) {
          source.unbind(mine.trigger);
        }
      };

      return {
        bind: bind,
        unbind: unbind,
        trigger: Fun.die("Cannot trigger a source event.")
      };
    };
  }
);
