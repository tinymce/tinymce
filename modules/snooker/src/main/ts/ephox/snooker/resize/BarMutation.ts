import { Option } from '@ephox/katamari';
import { Event, Events } from '@ephox/porkbun';
import Mutation from './Mutation';

export default function () {
  const events = Events.create({
    drag: Event(['xDelta', 'yDelta', 'target'])
  });

  let target = Option.none();

  const delegate = Mutation();

  delegate.events.drag.bind(function (event) {
    target.each(function (t) {
      // There is always going to be this padding / border collapse / margin problem with widths. I'll have to resolve that.
      events.trigger.drag(event.xDelta(), event.yDelta(), t);
    });
  });

  const assign = function (t) {
    target = Option.some(t);
  };

  const get = function () {
    return target;
  };

  return {
    assign,
    get,
    mutate: delegate.mutate,
    events: events.registry
  };
}