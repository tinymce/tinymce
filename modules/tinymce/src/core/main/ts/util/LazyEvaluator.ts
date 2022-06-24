import { Optional } from '@ephox/katamari';

const evaluateUntil = <T extends any[], R>(fns: Array<(...args: T) => Optional<R>>, args: T): Optional<R> => {
  for (let i = 0; i < fns.length; i++) {
    const result = fns[i].apply(null, args);
    if (result.isSome()) {
      return result;
    }
  }

  return Optional.none();
};

export {
  evaluateUntil
};
