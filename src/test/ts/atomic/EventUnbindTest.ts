import Event from 'ephox/porkbun/Event';
import { UnitTest } from '@ephox/refute';

UnitTest.test('EventUnbindTest', function() {
  var event = Event([]);

  var first = function () { event.unbind(first); };
  var second = function () {};

  event.bind(first);
  event.bind(second);

  // ensure unbind during trigger does not cause problems
  event.trigger();
});

