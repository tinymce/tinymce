import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Obj, Type } from '@ephox/katamari';
import { AlloyEventHandler, EventRunHandler } from '../api/events/AlloyEvents';
import { EventFormat, SimulatedEvent } from '../events/SimulatedEvent';

const nu = <T extends EventFormat>(parts: Partial<AlloyEventHandler<T>>): AlloyEventHandler<T> => {
  if (! Obj.hasNonNullableKey(parts, 'can') && !Obj.hasNonNullableKey(parts, 'abort') && !Obj.hasNonNullableKey(parts, 'run')) { throw new Error(
    'EventHandler defined by: ' + JSON.stringify(parts, null, 2) + ' does not have can, abort, or run!'
  );
  }
  return ValueSchema.asRawOrDie('Extracting event.handler', ValueSchema.objOfOnly([
    FieldSchema.defaulted('can', Fun.constant(true)),
    FieldSchema.defaulted('abort', Fun.constant(false)),
    FieldSchema.defaulted('run', Fun.noop)
  ]), parts);
};

const all = <T extends EventFormat>(handlers: Array<AlloyEventHandler<T>>, f: (handler: AlloyEventHandler<T>) => any) => (...args: any[]) => Arr.foldl(handlers, (acc, handler) => acc && f(handler).apply(undefined, args), true);

const any = <T extends EventFormat>(handlers: Array<AlloyEventHandler<T>>, f: (handler: AlloyEventHandler<T>) => any) => (...args: any[]) => Arr.foldl(handlers, (acc, handler) => acc || f(handler).apply(undefined, args), false);

const read = <T extends EventFormat>(handler: (() => SimulatedEvent<T>) | AlloyEventHandler<T>) => Type.isFunction(handler) ? {
  can: Fun.constant(true),
  abort: Fun.constant(false),
  run: handler
} : handler;

const fuse = <T extends EventFormat>(handlers: Array<AlloyEventHandler<T>>) => {
  const can = all(handlers, (handler) => handler.can);

  const abort = any(handlers, (handler) => handler.abort);

  const run = (...args: Parameters<EventRunHandler<T>>) => {
    Arr.each(handlers, (handler) => {
      // ASSUMPTION: Return value is unimportant.
      handler.run.apply(undefined, args);
    });
  };

  return nu<T>({
    can,
    abort,
    run
  });
};

export {
  read,
  fuse,
  nu
};
