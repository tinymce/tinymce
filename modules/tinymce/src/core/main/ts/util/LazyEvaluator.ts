import { Optional } from '@ephox/katamari';

const evaluateUntil = (fns, args) => {
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
