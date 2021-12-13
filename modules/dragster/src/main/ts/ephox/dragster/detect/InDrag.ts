import { Optional } from '@ephox/katamari';
import { Event, Events } from '@ephox/porkbun';
import { EventArgs, SugarPosition } from '@ephox/sugar';

import { DragMode } from '../api/DragApis';
import { DragEvents, DragState } from './DragTypes';

export const InDrag = (): DragState => {

  let previous = Optional.none<SugarPosition>();

  const reset = () => {
    previous = Optional.none();
  };

  // Return position delta between previous position and nu position,
  // or None if this is the first. Set the previous position to nu.
  const update = <T>(mode: DragMode<T>, nu: SugarPosition) => {
    const result = previous.map((old) => {
      return mode.compare(old, nu);
    });

    previous = Optional.some(nu);
    return result;
  };

  const onEvent = <T>(event: EventArgs<T>, mode: DragMode<T>) => {
    const dataOption = mode.extract(event);

    // Dragster move events require a position delta. The moveevent is only triggered
    // on the second and subsequent dragster move events. The first is dropped.
    dataOption.each((data) => {
      const offset = update(mode, data);
      offset.each((d) => {
        events.trigger.move(d);
      });
    });
  };

  const events: DragEvents = Events.create({
    move: Event([ 'info' ])
  });

  return {
    onEvent,
    reset,
    events: events.registry
  };
};
