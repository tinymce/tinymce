import { AddEventsBehaviour, AlloyEvents, Behaviour } from '@ephox/alloy';
import { Id } from '@ephox/katamari';

// Consider moving to alloy once it takes shape.

const namedEvents = (name: string, handlers: Array<AlloyEvents.AlloyEventKeyAndHandler<any>>): Behaviour.AlloyBehaviourRecord =>
  Behaviour.derive([
    AddEventsBehaviour.config(name, handlers)
  ]);

const unnamedEvents = (handlers: Array<AlloyEvents.AlloyEventKeyAndHandler<any>>): Behaviour.AlloyBehaviourRecord =>
  namedEvents(Id.generate('unnamed-events'), handlers);

export const SimpleBehaviours = {
  namedEvents,
  unnamedEvents
};
