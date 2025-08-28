import { Arr } from '@ephox/katamari';

import { Bindable, EventHandler } from './Event';

export interface Binder {
  readonly bind: <T>(registration: Bindable<T>, handler: EventHandler<T>) => void;
  readonly unbind: <T>(registration: Bindable<T>) => void;
  readonly unbindAll: () => void;
}

const create = (): Binder => {
  const registrations: Bindable<any>[] = [];
  const handlers: EventHandler<any>[] = [];

  const bind = <T>(registration: Bindable<T>, handler: EventHandler<T>) => {
    if (Arr.contains(registrations, registration)) {
      throw new Error('Invalid key, key already exists.');
    } else {
      registrations.push(registration);
      handlers.push(handler);
      registration.bind(handler);
    }
  };

  const unbind = <T>(registration: Bindable<T>) => {
    const index = Arr.indexOf(registrations, registration);
    index.fold(() => {
      throw new Error('Invalid key, does not exist.');
    }, (ind) => {
      registrations.splice(ind, 1);
      const handler = handlers.splice(ind, 1)[0];
      registration.unbind(handler);
    });
  };

  const unbindAll = () => {
    Arr.each(registrations, (registration, i) => {
      const handler = handlers[i];
      registration.unbind(handler);
    });

    registrations.splice(0, registrations.length);
    handlers.splice(0, handlers.length);
  };

  return {
    bind,
    unbind,
    unbindAll
  };
};

export {
  create
};
