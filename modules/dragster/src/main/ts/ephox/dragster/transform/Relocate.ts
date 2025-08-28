import { Bindable, Event, Events } from '@ephox/porkbun';
import { Css, SugarElement, SugarLocation } from '@ephox/sugar';

export interface RelocateEvent {
  readonly x: number;
  readonly y: number;
}

interface RelocateEvents {
  readonly registry: {
    readonly relocate: Bindable<RelocateEvent>;
  };
  readonly trigger: {
    readonly relocate: (x: number, y: number) => void;
  };
}

interface Relocate {
  readonly mutate: (x: number, y: number) => void;
  readonly events: RelocateEvents['registry'];
}

const both = (element: SugarElement<HTMLElement>): Relocate => {
  const mutate = (x: number, y: number) => {
    const location = SugarLocation.absolute(element);
    Css.setAll(element, {
      left: (location.left + x) + 'px',
      top: (location.top + y) + 'px'
    });
    events.trigger.relocate(x, y);
  };

  const events: RelocateEvents = Events.create({
    relocate: Event([ 'x', 'y' ])
  });

  return {
    mutate,
    events: events.registry
  };
};

export {
  both
};
