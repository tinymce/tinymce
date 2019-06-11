import { Arr } from '@ephox/katamari';
import { EventHandler, Bindable } from './Event';

const create = function () {
  const registrations: Bindable<any>[] = [];
  const handlers: EventHandler<any>[] = [];

  const bind = function (registration: Bindable<any>, handler: EventHandler<any>) {
    if (Arr.contains(registrations, registration)) {
      throw new Error('Invalid key, key already exists.');
    } else {
      registrations.push(registration);
      handlers.push(handler);
      registration.bind(handler);
    }
  };

  const unbind = function (registration: Bindable<any>) {
    const index = Arr.indexOf(registrations, registration);
    index.fold(function () {
      throw new Error('Invalid key, does not exist.');
    }, function (ind) {
      registrations.splice(ind, 1);
      const handler = handlers.splice(ind, 1)[0];
      registration.unbind(handler);
    });
  };

  const unbindAll = function () {
    Arr.each(registrations, function (registration, i) {
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

export default {
  create
};