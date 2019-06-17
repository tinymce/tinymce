import { Option } from '@ephox/katamari';
import { Event, Events, Bindable } from '@ephox/porkbun';
import { DragMode } from '../api/DragApis';
import { Position, EventArgs } from '@ephox/sugar';

export interface InDragEvent {
  info: () => Position;
}

interface InDragEvents {
  registry: {
    move: Bindable<InDragEvent>
  };
  trigger: {
    move: (info: Position) => void;
  };
}

export default function () {

  let previous = Option.none<Position>();

  const reset = function () {
    previous = Option.none();
  };

  // Return position delta between previous position and nu position,
  // or None if this is the first. Set the previous position to nu.
  const update = function (mode: DragMode, nu: Position) {
    const result = previous.map(function (old) {
      return mode.compare(old, nu);
    });

    previous = Option.some(nu);
    return result;
  };

  const onEvent = function (event: EventArgs, mode: DragMode) {
    const dataOption = mode.extract(event);

    // Dragster move events require a position delta. The moveevent is only triggered
    // on the second and subsequent dragster move events. The first is dropped.
    dataOption.each(function (data) {
      const offset = update(mode, data);
      offset.each(function (d) {
        events.trigger.move(d);
      });
    });
  };

  const events = Events.create({
    move: Event([ 'info' ])
  }) as InDragEvents;

  return {
    onEvent,
    reset,
    events: events.registry
  };
}