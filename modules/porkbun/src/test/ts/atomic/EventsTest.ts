import { Event, Bindable } from 'ephox/porkbun/Event';
import * as Events from 'ephox/porkbun/Events';
import SourceEvent from 'ephox/porkbun/SourceEvent';
import { UnitTest, assert } from '@ephox/bedrock-client';

interface MyEvent {
  name: () => string;
}

interface TestEvents {
  registry: {
    myEvent: Bindable<MyEvent>;
  };
  trigger: {
    myEvent: (name: string) => void;
  };
}

UnitTest.test('Events', function () {
  (function () {
    const events = Events.create({
      myEvent: Event([ 'name' ])
    }) as TestEvents;

    let called = false;
    let calledEvent: MyEvent | Record<string, () => any> = {};

    const handler = function (event: MyEvent) {
      calledEvent = event;
      called = true;
    };

    events.registry.myEvent.bind(handler);
    events.trigger.myEvent('something');

    assert.eq(true, called);
    assert.eq(true, calledEvent.hasOwnProperty('name'));
    assert.eq('something', calledEvent.name());

    called = false;
    calledEvent = {};

    events.registry.myEvent.unbind(handler);
    events.trigger.myEvent('something');

    assert.eq(false, called);
    assert.eq(false, calledEvent.hasOwnProperty('name'));

    // This should not throw an error
    events.registry.myEvent.unbind(handler);
  })();

  (function () {
    const events = Events.create({
      emptyEvent: Event([])
    });

    assert.throwsError(
      function () { events.registry.emptyEvent.bind(undefined as any); },
      'Event bind error: undefined handler'
    );
  })();

  (function () {
    const ea = Events.create({
      chook: Event([ 'a', 'b', 'c' ])
    });

    const eb = Events.create({
      quack: SourceEvent([ 'a', 'b', 'c' ], ea.registry.chook)
    });

    assert.throws(
      function () {
        try {
          eb.trigger.quack('hay', 'bee', 'quee');
        } catch (ex) {
          throw ex.message;
        }
      },
      'Cannot trigger a source event.'
    );

    eb.registry.quack.bind(function (evt) {
      assert.eq('ay', evt.a());
      assert.eq('bee', evt.b());
      assert.eq('sea', evt.c());
    });
    ea.trigger.chook('ay', 'bee', 'sea');

  })();

  (function () {
    const ea = Events.create({
      chook: Event([ 'a', 'b', 'c', 'd', 'e' ]) // superset of arguments
    });

    const eb = Events.create({
      quack: SourceEvent([ 'a', 'b', 'c' ], ea.registry.chook)
    });

    eb.registry.quack.bind(function (evt) {
      assert.eq('ay', evt.a());
      assert.eq('bee', evt.b());
      assert.eq('sea', evt.c());
    });
    ea.trigger.chook('ay', 'bee', 'sea', 'dee', 'eee');

  })();
});
