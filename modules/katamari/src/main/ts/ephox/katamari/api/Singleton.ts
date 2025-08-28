import { Cell } from './Cell';
import * as Fun from './Fun';
import { Optional } from './Optional';

interface Singleton<T> {
  readonly clear: () => void;
  readonly isSet: () => boolean;
  readonly get: () => Optional<T>;
  readonly set: (value: T) => void;
}

export interface Repeatable {
  readonly clear: () => void;
  readonly isSet: () => boolean;
  readonly get: () => Optional<number>;
  readonly set: (functionToRepeat: () => void) => void;
}

export interface Revocable<T> extends Singleton<T> { }

export interface Api<T> extends Singleton<T> {
  readonly run: (fn: (data: T) => void) => void;
}

export interface Value<T> extends Singleton<T> {
  readonly on: (fn: (data: T) => void) => void;
}

const singleton = <T> (doRevoke: (data: T) => void): Singleton<T> => {
  const subject = Cell(Optional.none<T>());

  const revoke = (): void => subject.get().each(doRevoke);

  const clear = () => {
    revoke();
    subject.set(Optional.none());
  };

  const isSet = () => subject.get().isSome();

  const get = (): Optional<T> => subject.get();

  const set = (s: T) => {
    revoke();
    subject.set(Optional.some(s));
  };

  return {
    clear,
    isSet,
    get,
    set
  };
};

export const repeatable = (delay: number): Repeatable => {
  const intervalId = Cell(Optional.none<number>());

  const revoke = (): void => intervalId.get().each((id) => clearInterval(id));

  const clear = () => {
    revoke();
    intervalId.set(Optional.none());
  };

  const isSet = () => intervalId.get().isSome();

  const get = (): Optional<number> => intervalId.get();

  const set = (functionToRepeat: () => void) => {
    revoke();
    intervalId.set(Optional.some(setInterval(functionToRepeat, delay)));
  };

  return {
    clear,
    isSet,
    get,
    set,
  };
};

export const destroyable = <T extends { destroy: () => void }> (): Revocable<T> => singleton<T>((s) => s.destroy());

export const unbindable = <T extends { unbind: () => void }> (): Revocable<T> => singleton<T>((s) => s.unbind());

export const api = <T extends { destroy: () => void }> (): Api<T> => {
  const subject = destroyable<T>();

  const run = (f: (data: T) => void) => subject.get().each(f);

  return {
    ...subject,
    run
  };
};

export const value = <T> (): Value<T> => {
  const subject = singleton(Fun.noop);

  const on = (f: (data: T) => void) => subject.get().each(f);

  return {
    ...subject,
    on
  };
};
