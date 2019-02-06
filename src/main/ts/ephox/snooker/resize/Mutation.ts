import { Event } from '@ephox/porkbun';
import { Events } from '@ephox/porkbun';



export default function () {
  var events = Events.create({
    'drag': Event(['xDelta', 'yDelta'])
  });

  var mutate = function (x, y) {
    events.trigger.drag(x, y);
  };

  return {
    mutate: mutate,
    events: events.registry
  };
};