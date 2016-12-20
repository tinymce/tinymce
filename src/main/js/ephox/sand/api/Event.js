define(
  'ephox.sand.api.Event',

  [
    'ephox.sand.util.Global'
  ],

  function (Global) {
    /*
     * NOT SUPPORTED ON IE AT ALL.
     *
     * Only used for mobile.
     *
     * https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
     */
    return function (name) {
      var f = Global.getOrDie('Event');
      return new f(name);
    };
  }
);