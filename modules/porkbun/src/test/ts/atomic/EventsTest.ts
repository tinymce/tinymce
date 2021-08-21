import { assert, UnitTest } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';

import { Bindable, Event } from 'ephox/porkbun/Event';
import * as Events from 'ephox/porkbun/Events';
import SourceEvent from 'ephox/porkbun/SourceEvent';

interface MyEvent {
  readonly name: string;
}

interface TestEvents {
  registry: {
    myEvent: Bindable<MyEvent>;
  };
  trigger: {
    myEvent: (name: string) => void;
  };
}

UnitTest.test('Events', () => {
  (() => {
    const events: TestEvents = Events.create({
      myEvent: Event([ 'name' ])
    });

    let called = false;
    let calledEvent: MyEvent | Record<string, () => any> = {};

    const handler = (event: MyEvent) => {
      calledEvent = event;
      called = true;
    };

    events.registry.myEvent.bind(handler);
    events.trigger.myEvent('something');

    assert.eq(true, called);
    assert.eq(true, Obj.has(calledEvent, 'name'));
    assert.eq('something', calledEvent.name);

    called = false;
    calledEvent = {};

    events.registry.myEvent.unbind(handler);
    events.trigger.myEvent('something');

    assert.eq(false, called);
    assert.eq(false, Obj.has(calledEvent, 'name'));

    // This should not throw an error
    events.registry.myEvent.unbind(handler);
  })();

  (() => {
    const events = Events.create({
      emptyEvent: Event([])
    });

    assert.throwsError(
      () => {
        events.registry.emptyEvent.bind(undefined as any);
      },
      'Event bind error: undefined handler'
    );
  })();

  (() => {
    const ea = Events.create({
      chook: Event([ 'a', 'b', 'c' ])
    });

    const eb = Events.create({
      quack: SourceEvent([ 'a', 'b', 'c' ], ea.registry.chook)
    });

    assert.throwsError(
      () => eb.trigger.quack('hay', 'bee', 'quee'),
      'Cannot trigger a source event.'
    );

    eb.registry.quack.bind((evt) => {
      assert.eq('ay', evt.a);
      assert.eq('bee', evt.b);
      assert.eq('sea', evt.c);
    });
    ea.trigger.chook('ay', 'bee', 'sea');

  })();

  (() => {
    const ea = Events.create({
      chook: Event([ 'a', 'b', 'c', 'd', 'e' ]) // superset of arguments
    });

    const eb = Events.create({
      quack: SourceEvent([ 'a', 'b', 'c' ], ea.registry.chook)
    });

    eb.registry.quack.bind((evt) => {
      assert.eq('ay', evt.a);
      assert.eq('bee', evt.b);
      assert.eq('sea', evt.c);
    });
    ea.trigger.chook('ay', 'bee', 'sea', 'dee', 'eee');

  })();
});
