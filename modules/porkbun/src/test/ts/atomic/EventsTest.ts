import { Assert, UnitTest } from '@ephox/bedrock-client';
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
    let calledEvent: MyEvent | Record<string, string> = {};

    const handler = (event: MyEvent) => {
      calledEvent = event;
      called = true;
    };

    events.registry.myEvent.bind(handler);
    events.trigger.myEvent('something');

    Assert.eq('', true, called);
    Assert.eq('', true, Obj.has(calledEvent, 'name'));
    Assert.eq('', 'something', calledEvent.name);

    called = false;
    calledEvent = {};

    events.registry.myEvent.unbind(handler);
    events.trigger.myEvent('something');

    Assert.eq('', false, called);
    Assert.eq('', false, Obj.has(calledEvent, 'name'));

    // This should not throw an error
    events.registry.myEvent.unbind(handler);
  })();

  (() => {
    const events = Events.create({
      emptyEvent: Event([])
    });

    Assert.throwsError(
      'Event bind error: undefined handler',
      () => {
        events.registry.emptyEvent.bind(undefined as any);
      }
    );
  })();

  (() => {
    const ea = Events.create({
      chook: Event([ 'a', 'b', 'c' ])
    });

    const eb = Events.create({
      quack: SourceEvent([ 'a', 'b', 'c' ], ea.registry.chook)
    });

    Assert.throwsError(
      'Cannot trigger a source event.',
      () => eb.trigger.quack('hay', 'bee', 'quee')
    );

    eb.registry.quack.bind((evt) => {
      Assert.eq('', 'ay', evt.a);
      Assert.eq('', 'bee', evt.b);
      Assert.eq('', 'sea', evt.c);
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
      Assert.eq('', 'ay', evt.a);
      Assert.eq('', 'bee', evt.b);
      Assert.eq('', 'sea', evt.c);
    });
    ea.trigger.chook('ay', 'bee', 'sea', 'dee', 'eee');

  })();
});
