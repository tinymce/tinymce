import { Arr } from '@ephox/katamari';

export type EventHandler<T> = (event: T) => void;

export interface Bindable<T> {
  bind: (handler: EventHandler<T>) => void;
  unbind: (handler: EventHandler<T>) => void;
}

export interface Event extends Bindable<any> {
  trigger: (...values: any[]) => void;
}

export const Event = (fields: string[]): Event => {
  let handlers: EventHandler<any>[] = [];

  const bind = (handler: EventHandler<any>) => {
    if (handler === undefined) {
      throw new Error('Event bind error: undefined handler');
    }
    handlers.push(handler);
  };

  const unbind = (handler: EventHandler<any>) => {
    // This is quite a bit slower than handlers.splice() but we hate mutation.
    // Unbind isn't used very often so it should be ok.
    handlers = Arr.filter(handlers, (h) => {
      return h !== handler;
    });
  };

  const trigger = <T> (...args: T[]) => {
    const event: Record<string, T> = {};
    Arr.each(fields, (name, i) => {
      event[name] = args[i];
    });
    Arr.each(handlers, (handler) => {
      handler(event);
    });
  };

  return {
    bind,
    unbind,
    trigger
  };
};
