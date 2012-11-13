define(
  'ephox.porkbun.SourceEvent',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.porkbun.Event'
  ],

  function (Arr, Fun, Event) {

    /** An event sourced from another event.

      :: ([String], {bind: ..., unbind: ...}) -> SourceEvent
    */
    return function (fields, source) {
      var mine = Event(fields);
      var numHandlers = 0;

      var triggerer = function(evt) {
        // yay! Let's unbox this event, convert it to a varargs, so it can be re-boxed!
        var args = Arr.map(fields, function (field) {
          return evt[field]();
        });
        mine.trigger.apply(null, args);
      };

      var bind = function (handler) {
        mine.bind(handler);
        numHandlers++;
        if (numHandlers === 1) {
          source.bind(triggerer);
        }
      };

      var unbind = function (handler) {
        mine.unbind(handler);
        numHandlers--;
        if (numHandlers === 0) {
          source.unbind(triggerer);
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
