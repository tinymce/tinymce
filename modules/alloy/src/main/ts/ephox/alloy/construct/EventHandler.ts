import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Obj, Type } from '@ephox/katamari';

const nu = (parts) => {
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

const all = (handlers, f) => {
  return (...args) => {
    return Arr.foldl(handlers, (acc, handler) => {
      return acc && f(handler).apply(undefined, args);
    }, true);
  };
};

const any = (handlers, f) => {
  return (...args) => {
    return Arr.foldl(handlers, (acc, handler) => {
      return acc || f(handler).apply(undefined, args);
    }, false);
  };
};

const read = (handler) => {
  return Type.isFunction(handler) ? {
    can: Fun.constant(true),
    abort: Fun.constant(false),
    run: handler
  } : handler;
};

const fuse = (handlers) => {
  const can = all(handlers, (handler) => {
    return handler.can;
  });

  const abort = any(handlers, (handler) => {
    return handler.abort;
  });

  const run = (...args) => {
    Arr.each(handlers, (handler) => {
      // ASSUMPTION: Return value is unimportant.
      handler.run.apply(undefined, args);
    });
  };

  return nu({
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
