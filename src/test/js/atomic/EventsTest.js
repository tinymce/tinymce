test(
  'Events',

  [
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.porkbun.SourceEvent',
    'ephox.scullion.Struct'
  ],

  function(Event, Events, SourceEvent, Struct) {

    (function() {
      var events = Events.create({
        myEvent: Event(["name"])
      });

      var called = false;
      var calledEvent = {};

      var handler = function(event) {
        calledEvent = event;
        called = true;
      };

      events.registry.myEvent.bind(handler)
      events.trigger.myEvent("something");

      assert.eq(true, called);
      assert.eq(true, calledEvent.hasOwnProperty("name"));
      assert.eq("something", calledEvent.name());

      called = false;
      calledEvent = {};

      events.registry.myEvent.unbind(handler);
      events.trigger.myEvent("something");

      assert.eq(false, called);
      assert.eq(false, calledEvent.hasOwnProperty("name"));

      // This should not throw an error
      events.registry.myEvent.unbind(handler);
    })();

    (function() {
      var events = Events.create({
        emptyEvent: Event([])
      });

      assert.throws(
        function() { events.registry.emptyEvent.bind(undefined); },
        'Event bind error: undefined handler'
      );
    })();

    (function() {
      var ea = Events.create({
        chook: Event(['a' ,'b', 'c'])
      });

      var eb = Events.create({
        quack: SourceEvent(['a', 'b', 'c'], ea.registry.chook)
      });

      assert.throws(
        function() { eb.trigger.quack('hay', 'bee', 'quee'); },
        'Cannot trigger a source event.'
      );

      var called = false;
      eb.registry.quack.bind(function(a, b, c) {
        called = true;
        assert.eq('ay', a);
        assert.eq('bee', b);
        assert.eq('sea', c);
      });
      ea.trigger.chook('ay', 'bee', 'sea');


    })();
  }
);
