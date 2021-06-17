import { Optional } from '@ephox/katamari';
import { Bindable, Event, Events } from '@ephox/porkbun';
import { SugarElement } from '@ephox/sugar';

import { DragDistanceEvent, Mutation } from './Mutation';

export interface DragEvent extends DragDistanceEvent {
  readonly target: SugarElement;
}

interface DragDistanceEvents {
  registry: {
    drag: Bindable<DragEvent>;
  };
  trigger: {
    drag: (xDelta: number, yDelta: number, target: SugarElement) => void;
  };
}

export interface BarMutation {
  assign: (t: SugarElement) => void;
  get: () => Optional<SugarElement>;
  mutate: (x: number, y: number) => void;
  events: {
    drag: Bindable<DragEvent>;
  };
}

export const BarMutation = (): BarMutation => {
  const events: DragDistanceEvents = Events.create({
    drag: Event([ 'xDelta', 'yDelta', 'target' ])
  });

  let target = Optional.none<SugarElement>();

  const delegate = Mutation();

  delegate.events.drag.bind((event) => {
    target.each((t) => {
      // There is always going to be this padding / border collapse / margin problem with widths. I'll have to resolve that.
      events.trigger.drag(event.xDelta, event.yDelta, t);
    });
  });

  const assign = (t: SugarElement) => {
    target = Optional.some(t);
  };

  const get = () => {
    return target;
  };

  return {
    assign,
    get,
    mutate: delegate.mutate,
    events: events.registry
  };
};
