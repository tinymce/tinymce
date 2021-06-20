import { Arr, Fun } from '@ephox/katamari';

import { Bindable, Event, EventHandler } from './Event';

export default (fields: string[], source: Bindable<any>): Event => {
  const mine = Event(fields);
  let numHandlers = 0;

  const triggerer = (evt: Record<string, any>) => {
    // yay! Let's unbox this event, convert it to a constargs, so it can be re-boxed!
    const args = Arr.map(fields, (field) => {
      return evt[field];
    });
    mine.trigger.apply(null, args);
  };

  const bind = (handler: EventHandler<any>) => {
    mine.bind(handler);
    numHandlers++;
    if (numHandlers === 1) {
      source.bind(triggerer);
    }
  };

  const unbind = (handler: EventHandler<any>) => {
    mine.unbind(handler);
    numHandlers--;
    if (numHandlers === 0) {
      source.unbind(triggerer);
    }
  };

  return {
    bind,
    unbind,
    trigger: Fun.die('Cannot trigger a source event.')
  };
};
