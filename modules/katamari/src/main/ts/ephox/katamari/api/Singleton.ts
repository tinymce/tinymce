import { Option } from './Option';
import { Cell } from './Cell';

const revocable = function <T> (doRevoke: (data: T) => void) {
  const subject = Cell(Option.none<T>());

  const revoke = function () {
    subject.get().each(doRevoke);
  };

  const clear = function () {
    revoke();
    subject.set(Option.none());
  };

  const set = function (s: T) {
    revoke();
    subject.set(Option.some(s));
  };

  const isSet = function () {
    return subject.get().isSome();
  };

  return {
    clear: clear,
    isSet: isSet,
    set: set
  };
};

export const destroyable = function <T extends { destroy: () => void; }> () {
  return revocable<T>(function (s) {
    s.destroy();
  });
};

export const unbindable = function <T extends { unbind: () => void; }> () {
  return revocable<T>(function (s) {
    s.unbind();
  });
};

export const api = function <T extends { destroy: () => void; }> () {
  const subject = Cell(Option.none<T>());

  const revoke = function () {
    subject.get().each(function (s) {
      s.destroy();
    });
  };

  const clear = function () {
    revoke();
    subject.set(Option.none());
  };

  const set = function (s: T) {
    revoke();
    subject.set(Option.some(s));
  };

  const run = function (f: (data: T) => void) {
    subject.get().each(f);
  };

  const isSet = function () {
    return subject.get().isSome();
  };

  return {
    clear: clear,
    isSet: isSet,
    set: set,
    run: run
  };
};

export const value = function <T> () {
  const subject = Cell(Option.none<T>());

  const clear = function () {
    subject.set(Option.none());
  };

  const set = function (s: T) {
    subject.set(Option.some(s));
  };

  const on = function (f: (data: T) => void) {
    subject.get().each(f);
  };

  const isSet = function () {
    return subject.get().isSome();
  };

  return {
    clear: clear,
    set: set,
    isSet: isSet,
    on: on
  };
};