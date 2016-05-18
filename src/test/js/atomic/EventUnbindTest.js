test(
  'EventUnbindTest',

  [
    'ephox.porkbun.Event'
  ],

  function (Event) {
    var event = Event([]);

    var first = function () { event.unbind(first); };
    var second = function () {};

    event.bind(first);
    event.bind(second);

    // ensure unbind during trigger does not cause problems
    event.trigger();
  }
);