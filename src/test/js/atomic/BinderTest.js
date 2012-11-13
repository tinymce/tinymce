test(
  'Binder',

  [
    'ephox.porkbun.Binder',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.scullion.Struct'
  ],

  function (Binder, Event, Events, Struct) {
    var events = Events.create({
      myEvent: Event(['one', 'two'])
    });

    var binder = Binder.create();

    var called = false;

    binder.bind(events.registry.myEvent, function(event) {
      called = true;
    });

    assert.throws(function () {
      binder.bind(events.registry.myEvent, function(event) {
        called = true;
      });
    });

    events.trigger.myEvent('a', 'b');
    assert.eq(true, called);

    called = false;

    binder.unbind(events.registry.myEvent);

    events.trigger.myEvent('a', 'b');
    assert.eq(false, called);

    assert.throws(function () {
      binder.unbind(events.registry.myEvent);
    });
  }
);
