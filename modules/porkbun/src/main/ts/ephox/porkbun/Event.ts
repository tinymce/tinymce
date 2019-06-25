import { Arr, Struct } from '@ephox/katamari';

export type EventHandler<T> = (event: T) => void;

export interface Bindable<T> {
  bind: (handler: EventHandler<T>) => void;
  unbind: (handler: EventHandler<T>) => void;
}

export interface Event extends Bindable<any> {
  trigger: (...values: any[]) => void;
}

export const Event = function (fields: string[]): Event {
  const struct = Struct.immutable.apply(null, fields);

  let handlers: EventHandler<any>[] = [];

  const bind = function (handler: EventHandler<any>) {
    if (handler === undefined) {
      throw new Error('Event bind error: undefined handler');
    }
    handlers.push(handler);
  };

  const unbind = function (handler: EventHandler<any>) {
    // This is quite a bit slower than handlers.splice() but we hate mutation.
    // Unbind isn't used very often so it should be ok.
    handlers = Arr.filter(handlers, function (h) {
      return h !== handler;
    });
  };

  const trigger = function (...args: any[]) {
    const event = struct.apply(null, args);
    Arr.each(handlers, function (handler) {
      handler(event);
    });
  };

  return {
    bind,
    unbind,
    trigger
  };
};