import { Fun } from '@ephox/katamari';
import { Event, Events } from '@ephox/porkbun';

import type { DragEvents, DragState } from './DragTypes';

export const NoDrag = (): DragState => {
  const events: DragEvents = Events.create({
    move: Event([ 'info' ])
  });

  return {
    onEvent: Fun.noop,
    reset: Fun.noop,
    events: events.registry
  };
};
