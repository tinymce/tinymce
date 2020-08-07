import { Optional } from '@ephox/katamari';
import { Bindable, Event, Events } from '@ephox/porkbun';
import { EventArgs, SugarPosition } from '@ephox/sugar';
import { DragMode } from '../api/DragApis';

export interface InDragEvent {
  readonly info: SugarPosition;
}

interface InDragEvents {
  registry: {
    move: Bindable<InDragEvent>;
  };
  trigger: {
    move: (info: SugarPosition) => void;
  };
}

export default function () {

  let previous = Optional.none<SugarPosition>();

  const reset = function () {
    previous = Optional.none();
  };

  // Return position delta between previous position and nu position,
  // or None if this is the first. Set the previous position to nu.
  const update = function (mode: DragMode, nu: SugarPosition) {
    const result = previous.map(function (old) {
      return mode.compare(old, nu);
    });

    previous = Optional.some(nu);
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
