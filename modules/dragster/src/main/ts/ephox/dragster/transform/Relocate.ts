import { Event, Events, Bindable } from '@ephox/porkbun';
import { Css, Location, Element } from '@ephox/sugar';

export interface RelocateEvent {
  x: () => number;
  y: () => number;
}

interface RelocateEvents {
  registry: {
    relocate: Bindable<RelocateEvent>;
  };
  trigger: {
    relocate: (x: number, y: number) => void;
  };
}

const both = function (element: Element) {
  const mutate = function (x: number, y: number) {
    const location = Location.absolute(element);
    Css.setAll(element, {
      left: (location.left() + x) + 'px',
      top: (location.top() + y) + 'px'
    });
    events.trigger.relocate(x, y);
  };

  const events = Events.create({
    relocate: Event(['x', 'y'])
  }) as RelocateEvents;

  return {
    mutate,
    events: events.registry
  };
};

export {
  both
};