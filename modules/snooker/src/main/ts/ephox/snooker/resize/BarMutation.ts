import { Option } from '@ephox/katamari';
import { Event, Events, Bindable } from '@ephox/porkbun';
import { Mutation, DragDistanceEvent } from './Mutation';
import { Element } from '@ephox/sugar';

export interface DragEvent extends DragDistanceEvent {
  target: () => Element;
}

interface DragDistanceEvents {
  registry: {
    drag: Bindable<DragEvent>
  };
  trigger: {
      drag: (xDelta: number, yDelta: number, target: Element) => void;
  };
}

export interface BarMutation {
  assign: (t: Element) => void;
  get: () => Option<Element>;
  mutate: (x: number, y: number) => void;
  events: {
      drag: Bindable<DragEvent>;
  };
}

export const BarMutation = function (): BarMutation {
  const events = Events.create({
    drag: Event(['xDelta', 'yDelta', 'target'])
  }) as DragDistanceEvents;

  let target = Option.none<Element>();

  const delegate = Mutation();

  delegate.events.drag.bind(function (event) {
    target.each(function (t) {
      // There is always going to be this padding / border collapse / margin problem with widths. I'll have to resolve that.
      events.trigger.drag(event.xDelta(), event.yDelta(), t);
    });
  });

  const assign = function (t: Element) {
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
};