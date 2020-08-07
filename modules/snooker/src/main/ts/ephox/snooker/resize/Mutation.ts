import { Bindable, Event, Events } from '@ephox/porkbun';

export interface DragDistanceEvent {
  readonly xDelta: number;
  readonly yDelta: number;
}

interface DragDistanceEvents {
  registry: {
    drag: Bindable<DragDistanceEvent>;
  };
  trigger: {
    drag: (xDelta: number, yDelta: number) => void;
  };
}

export interface Mutation {
  mutate: (x: number, y: number) => void;
  events: DragDistanceEvents['registry'];
}

export const Mutation = function (): Mutation {
  const events = Events.create({
    drag: Event([ 'xDelta', 'yDelta' ])
  }) as unknown as DragDistanceEvents;

  const mutate = function (x: number, y: number) {
    events.trigger.drag(x, y);
  };

  return {
    mutate,
    events: events.registry
  };
};
