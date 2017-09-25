test(
  'Binder',

  [
    'ephox.porkbun.Binder',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events'
  ],

  function (Binder, Event, Events) {
    var events = Events.create({
      myEvent: Event([ ]),
      secondEvent: Event([ ])
    });

    var binder = Binder.create();

    var called = false;

    binder.bind(events.registry.myEvent, function(event) {
      called = true;
    });

    // No longer throws when adding an event twice, just doesn't add it
    binder.bind(events.registry.myEvent, function(event) {
      called = true;
    });

    events.trigger.myEvent();
    assert.eq(true, called);

    called = false;

    binder.unbind(events.registry.myEvent);

    events.trigger.myEvent();
    assert.eq(false, called);

    // No longer throws when removing an event that no longer exists, just doesn't remove it
    binder.unbind(events.registry.myEvent);

    var count = 0;

    binder.bind(events.registry.myEvent, function(event) {
      count++;
    });

    binder.bind(events.registry.secondEvent, function(event) {
      count++;
    });

    binder.unbindAll();

    events.trigger.myEvent();
    events.trigger.secondEvent();

    assert.eq(0, count);
  }
);
