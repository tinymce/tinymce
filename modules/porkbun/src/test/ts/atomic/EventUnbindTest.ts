import { Event } from 'ephox/porkbun/Event';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('EventUnbindTest', function () {
  const event = Event([]);

  const first = function () { event.unbind(first); };
  const second = function () {};

  event.bind(first);
  event.bind(second);

  // ensure unbind during trigger does not cause problems
  event.trigger();
});
