import { Arr, Result } from "@ephox/katamari";

// An experiment to make a more efficient boulder.
export type SimpleResult<E,A> = SimpleError<E> | SimpleValue<A>

export interface SimpleError<E> {
  stype: 'error';
  serror: E;
}

export interface SimpleValue<A> {
  stype: 'value';
  svalue: A;
}

const fold = <B, E, A>(res: SimpleResult<E, A>, onError: (err: E) => B, onValue: (val: A) => B): B => {
  if (res.stype === 'error') {
    return onError(res.serror);
  } else {
    return onValue(res.svalue);
  }
};

const partition = <E, A>(results: SimpleResult<E[], any>[]): { values: any[], errors: E[][] } => {
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
  if (res.stype === 'error') {
    return { stype: 'error', serror: f(res.serror) }
  }
  else {
    return res;
  }
}

const map = <B, E, A>(res: SimpleResult<E, A>, f: (a: A) => B): SimpleResult<E, B> => {
  if (res.stype === 'value') {
    return { stype: 'value', svalue: f(res.svalue) }
  }
  else {
    return res;
  }
};


const bind = <B, E, A>(res: SimpleResult<E, A>, f: (a: A) => SimpleResult<E, B>): SimpleResult<E, B> => {
  if (res.stype === 'value') {
    return f(res.svalue);
  }
  else {
    return res;
  }
};

const bindError = <F, E, A>(res: SimpleResult<E, A>, f: (e: E) => SimpleResult<F, A>): SimpleResult<F, A> => {
  if (res.stype === 'error') {
    return f(res.serror);
  }
  else {
    return res;
  }
};

const svalue = <E, A>(v: A): SimpleResult<E, A> => {
  return { stype: 'value', svalue: v };
};

const serror = <E, A>(e: E): SimpleResult<E, A> => {
  return { stype: 'error', serror: e };
};

const toResult = <E, A>(res: SimpleResult<E, A>): Result<A, E> => {
  return fold(res, Result.error, Result.value);
};

const fromResult = <E, A>(res: Result<A, E>): SimpleResult<E, A> => {
  return res.fold<SimpleResult<E, A>>(serror, svalue);
}

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
}