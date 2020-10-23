import { UnitTest } from '@ephox/bedrock-client';
import { Event } from 'ephox/porkbun/Event';

UnitTest.test('EventUnbindTest', function () {
  const event = Event([]);

  const first = function () { event.unbind(first); };
  const second = function () {};

  event.bind(first);
  event.bind(second);

  // ensure unbind during trigger does not cause problems
  event.trigger();
});
