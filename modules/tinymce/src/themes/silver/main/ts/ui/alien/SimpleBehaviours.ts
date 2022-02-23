import { AddEventsBehaviour, Behaviour } from '@ephox/alloy';
import { Id } from '@ephox/katamari';

// Consider moving to alloy once it takes shape.

const namedEvents = (name, handlers) => Behaviour.derive([
  AddEventsBehaviour.config(name, handlers)
]);

const unnamedEvents = (handlers) => namedEvents(Id.generate('unnamed-events'), handlers);

export const SimpleBehaviours = {
  namedEvents,
  unnamedEvents
};
