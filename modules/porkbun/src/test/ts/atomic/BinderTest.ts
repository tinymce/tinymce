import { assert, UnitTest } from '@ephox/bedrock-client';

import * as Binder from 'ephox/porkbun/Binder';
import { Event } from 'ephox/porkbun/Event';
import * as Events from 'ephox/porkbun/Events';

UnitTest.test('Binder', () => {
  const events = Events.create({
    myEvent: Event([]),
    secondEvent: Event([])
  });

  const binder = Binder.create();

  let called = false;

  binder.bind(events.registry.myEvent, (_event) => {
    called = true;
  });

  assert.throws(() => {
    binder.bind(events.registry.myEvent, (_event) => {
      called = true;
    });
  });

  events.trigger.myEvent();
  assert.eq(true, called);

  called = false;

  binder.unbind(events.registry.myEvent);

  events.trigger.myEvent();
  assert.eq(false, called);

  assert.throws(() => {
    binder.unbind(events.registry.myEvent);
  });

  let count = 0;

  binder.bind(events.registry.myEvent, (_event) => {
    count++;
  });

  binder.bind(events.registry.secondEvent, (_event) => {
    count++;
  });

  binder.unbindAll();

  events.trigger.myEvent();
  events.trigger.secondEvent();

  assert.eq(0, count);
});
