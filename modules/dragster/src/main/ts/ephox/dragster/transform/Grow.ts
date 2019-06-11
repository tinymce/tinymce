import { Fun } from '@ephox/katamari';
import { Event, Events, Bindable } from '@ephox/porkbun';
import { Height, Width, Element } from '@ephox/sugar';

export interface GrowEvent {
  x: () => number;
  y: () => number;
}

interface GrowEvents {
  registry: {
    grow: Bindable<GrowEvent>;
  };
  trigger: {
      grow: (x: number, y: number) => void;
  };
}

interface Growth {
  x: () => number;
  y: () => number;
}

type GrowthFn = (x: number, y: number) => Growth;

const grower = function (f: GrowthFn) {
  return function (element: Element) {
    const events = Events.create({
      grow: Event(['x', 'y'])
    }) as GrowEvents;

    const mutate =  function (x: number, y: number) {
      const growth = f(x, y);
      const width = Width.get(element);
      const height = Height.get(element);
      Width.set(element, width + growth.x());
      Height.set(element, height + growth.y());
      events.trigger.grow(growth.x(), growth.y());
    };

    return {
      mutate,
      events: events.registry
    };
  };
};

const both = grower(function (x, y): Growth {
  return {
    x: Fun.constant(x),
    y: Fun.constant(y)
  };
});

const horizontal = grower(function (x, y): Growth  {
  return {
    x: Fun.constant(x),
    y: Fun.constant(0)
  };
});

const vertical = grower(function (x, y): Growth  {
  return {
    x: Fun.constant(0),
    y: Fun.constant(y)
  };
});

export {
  both,
  horizontal,
  vertical
};