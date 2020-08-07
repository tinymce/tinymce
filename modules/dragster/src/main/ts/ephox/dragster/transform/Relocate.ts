import { Bindable, Event, Events } from '@ephox/porkbun';
import { Css, SugarElement, SugarLocation } from '@ephox/sugar';

export interface RelocateEvent {
  readonly x: number;
  readonly y: number;
}

interface RelocateEvents {
  registry: {
    relocate: Bindable<RelocateEvent>;
  };
  trigger: {
    relocate: (x: number, y: number) => void;
  };
}

const both = function (element: SugarElement) {
  const mutate = function (x: number, y: number) {
    const location = SugarLocation.absolute(element);
    Css.setAll(element, {
      left: (location.left + x) + 'px',
      top: (location.top + y) + 'px'
    });
    events.trigger.relocate(x, y);
  };

  const events = Events.create({
    relocate: Event([ 'x', 'y' ])
  }) as RelocateEvents;

  return {
    mutate,
    events: events.registry
  };
};

export {
  both
};
