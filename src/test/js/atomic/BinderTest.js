test(
  'Binder',

  [
    'ephox.scullion.Struct',
    'ephox.porkbun.Events',
    'ephox.porkbun.Binder'
  ],

  function (Struct, Events, Binder) {
    var events = Events.create({
      myEvent: Struct.immutable('one', 'two')
    });

    var binder = Binder.create();

    var called = false;

    binder.bind(events.registry.myEvent, function(event) {
      called = true;
    });

    jssert.assertThrows(function () {
      binder.bind(events.registry.myEvent, function(event) {
        called = true;
      });
    });

    events.trigger.myEvent('a', 'b');
    jssert.assertEq(true, called);

    called = false;

    binder.unbind(events.registry.myEvent);

    events.trigger.myEvent('a', 'b');
    jssert.assertEq(false, called);

    jssert.assertThrows(function () {
      binder.unbind(events.registry.myEvent);
    });
  }
);