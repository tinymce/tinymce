import { Arr, Result } from '@ephox/katamari';

// An experiment to make a more efficient boulder.
export type SimpleResult<E, A> = SimpleError<E> | SimpleValue<A>;

export enum SimpleResultType { Error, Value }

export interface SimpleError<E> {
  stype: SimpleResultType.Error;
  serror: E;
}

export interface SimpleValue<A> {
  stype: SimpleResultType.Value;
  svalue: A;
}

const fold = <B, E, A>(res: SimpleResult<E, A>, onError: (err: E) => B, onValue: (val: A) => B): B => {
  return res.stype === SimpleResultType.Error ? onError(res.serror) : onValue(res.svalue);
};

const partition = <E, A>(results: Array<SimpleResult<E[], any>>): { values: any[], errors: E[][] } => {
  const values = [ ];
  const errors = [ ];
  Arr.each(results, (obj) => {
    fold(
      obj,
      (err) => errors.push(err),
      (val) => values.push(val)
    );
  });
  return { values, errors };
};

const mapError = <F, E, A>(res: SimpleResult<E, A>, f: (e: E) => F): SimpleResult<F, A> => {
  if (res.stype === SimpleResultType.Error) {
    return { stype: SimpleResultType.Error, serror: f(res.serror) };
  } else {
    return res;
  }
};

const map = <B, E, A>(res: SimpleResult<E, A>, f: (a: A) => B): SimpleResult<E, B> => {
  if (res.stype === SimpleResultType.Value) {
    return { stype: SimpleResultType.Value, svalue: f(res.svalue) };
  } else {
    return res;
  }
};

const bind = <B, E, A>(res: SimpleResult<E, A>, f: (a: A) => SimpleResult<E, B>): SimpleResult<E, B> => {
  if (res.stype === SimpleResultType.Value) {
    return f(res.svalue);
  } else {
    return res;
  }
};

const bindError = <F, E, A>(res: SimpleResult<E, A>, f: (e: E) => SimpleResult<F, A>): SimpleResult<F, A> => {
  if (res.stype === SimpleResultType.Error) {
    return f(res.serror);
  } else {
    return res;
  }
};

const svalue = <E, A>(v: A): SimpleResult<E, A> => {
  return { stype: SimpleResultType.Value, svalue: v };
};

const serror = <E, A>(e: E): SimpleResult<E, A> => {
  return { stype: SimpleResultType.Error, serror: e };
};

const toResult = <E, A>(res: SimpleResult<E, A>): Result<A, E> => {
  return fold(res, Result.error, Result.value);
};

const fromResult = <E, A>(res: Result<A, E>): SimpleResult<E, A> => {
  return res.fold<SimpleResult<E, A>>(serror, svalue);
};

export const SimpleResult = {
  fromResult,
  toResult,
  svalue,
  partition,
  serror,
  bind,
  bindError,
  map,
  mapError,
  fold
};
