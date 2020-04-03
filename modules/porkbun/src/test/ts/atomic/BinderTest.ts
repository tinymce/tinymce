import * as Binder from 'ephox/porkbun/Binder';
import { Event } from 'ephox/porkbun/Event';
import * as Events from 'ephox/porkbun/Events';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.test('Binder', function () {
  const events = Events.create({
    myEvent: Event([]),
    secondEvent: Event([])
  });

  const binder = Binder.create();

  let called = false;

  binder.bind(events.registry.myEvent, function (_event) {
    called = true;
  });

  assert.throws(function () {
    binder.bind(events.registry.myEvent, function (_event) {
      called = true;
    });
  });

  events.trigger.myEvent();
  assert.eq(true, called);

  called = false;

  binder.unbind(events.registry.myEvent);

  events.trigger.myEvent();
  assert.eq(false, called);

  assert.throws(function () {
    binder.unbind(events.registry.myEvent);
  });

  let count = 0;

  binder.bind(events.registry.myEvent, function (_event) {
    count++;
  });

  binder.bind(events.registry.secondEvent, function (_event) {
    count++;
  });

  binder.unbindAll();

  events.trigger.myEvent();
  events.trigger.secondEvent();

  assert.eq(0, count);
});
