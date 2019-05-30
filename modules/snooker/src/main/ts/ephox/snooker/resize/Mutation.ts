import { Event, Events } from '@ephox/porkbun';

export default function () {
  const events = Events.create({
    drag: Event(['xDelta', 'yDelta'])
  });

  const mutate = function (x, y) {
    events.trigger.drag(x, y);
  };

  return {
    mutate,
    events: events.registry
  };
}