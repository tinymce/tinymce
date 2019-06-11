import { Throttler } from '@ephox/katamari';
import { Event, Events, Bindable } from '@ephox/porkbun';
import { DragMode, DragApi, DragMutation } from '../api/DragApis';
import Movement from '../detect/Movement';
import { BlockerOptions } from '../detect/Blocker';
import { Element, EventArgs } from '@ephox/sugar';

interface DragActionEvents {
  registry: {
    start: Bindable<{}>,
    stop: Bindable<{}>
  };
  trigger: {
    start: () => void;
    stop: () => void;
  };
}

const setup = function (mutation: DragMutation, mode: DragMode, settings: Partial<BlockerOptions>) {
  let active = false;

  const events = Events.create({
    start: Event([]),
    stop: Event([])
  }) as DragActionEvents;

  const movement = Movement();

  const drop = function () {
    sink.stop();
    if (movement.isOn()) {
      movement.off();
      events.trigger.stop();
    }
  };

  const throttledDrop = Throttler.last(drop, 200);

  const go = function (parent: Element) {
    sink.start(parent);
    movement.on();
    events.trigger.start();
  };

  const mousemove = function (event: EventArgs) {
    throttledDrop.cancel();
    movement.onEvent(event, mode);
  };

  movement.events.move.bind(function (event) {
    mode.mutate(mutation, event.info());
  });

  const on = function () {
    active = true;
  };

  const off = function () {
    active = false;
    // acivate some events here?
  };

  const runIfActive = function <F extends (...args: any[]) => any> (f: F) {
    return function (...args: Parameters<F>) {
      if (active) {
        f.apply(null, args);
      }
    };
  };

  const sink = mode.sink(DragApi({
    // ASSUMPTION: runIfActive is not needed for mousedown. This is pretty much a safety measure for
    // inconsistent situations so that we don't block input.
    forceDrop: drop,
    drop: runIfActive(drop),
    move: runIfActive(mousemove),
    delayDrop: runIfActive(throttledDrop.throttle)
  }), settings);

  const destroy = function () {
    sink.destroy();
  };

  return {
    element: sink.element,
    go,
    on,
    off,
    destroy,
    events: events.registry
  };
};

export default {
  setup
};