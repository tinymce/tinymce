import { Maybe } from './Maybe';

export interface Just<T> {
  readonly tag: 'JUST';
  readonly value: T;
}

export interface Nothing {
  readonly tag: 'NOTHING';
}

// Constructors
export const just = <T>(value: T): Maybe<T> => ({
  tag: 'JUST',
  value
});

export const nothing: Maybe<any> = {
  tag: 'NOTHING'
};

export const from = <T>(value: T | null | undefined): Maybe<NonNullable<T>> => {

  const isNotNull = <U>(val: U | null | undefined): val is NonNullable<U> =>
    val !== null && val !== undefined;

  if (isNotNull(value)) {
    return just(value);
  } else {
    return nothing;
  }
};

// Identities
export const fold = <T, U>(self: Maybe<T>, ifNothing: () => U, ifJust: (value: T) => U): U => {
  switch (self.tag) {
    case 'JUST':
      return ifJust(self.value);
    case 'NOTHING':
      return ifNothing();
  }
};

// Functor
export const map = <T, U>(self: Maybe<T>, f: (input: T) => U): Maybe<U> => {
  switch (self.tag) {
    case 'JUST':
      return just(f(self.value));
    case 'NOTHING':
      return self;
  }
};

// Applicative
export const lift2 = <A, B, Out>(a: Maybe<A>, b: Maybe<B>, f: (a: A, b: B) => Out): Maybe<Out> => {
  if (a.tag === 'JUST' && b.tag === 'JUST') {
    return just(f(a.value, b.value));
  } else {
    return nothing;
  }
};

export const lift3 = <A, B, C, Out>(a: Maybe<A>, b: Maybe<B>, c: Maybe<C>, f: (a: A, b: B, c: C) => Out): Maybe<Out> => {
  if (a.tag === 'JUST' && b.tag === 'JUST' && c.tag === 'JUST') {
    return just(f(a.value, b.value, c.value));
  } else {
    return nothing;
  }
};

export const lift4 = <A, B, C, D, Out>(a: Maybe<A>, b: Maybe<B>, c: Maybe<C>, d: Maybe<D>, f: (a: A, b: B, c: C, d: D) => Out): Maybe<Out> => {
  if (a.tag === 'JUST' && b.tag === 'JUST' && c.tag === 'JUST' && d.tag === 'JUST') {
    return just(f(a.value, b.value, c.value, d.value));
  } else {
    return nothing;
  }
};

export const lift5 = <A, B, C, D, E, Out>(a: Maybe<A>, b: Maybe<B>, c: Maybe<C>, d: Maybe<D>, e: Maybe<E>, f: (a: A, b: B, c: C, d: D, e: E) => Out): Maybe<Out> => {
  if (a.tag === 'JUST' && b.tag === 'JUST' && c.tag === 'JUST' && d.tag === 'JUST' && e.tag === 'JUST') {
    return just(f(a.value, b.value, c.value, d.value, e.value));
  } else {
    return nothing;
  }
};

// Monad
export const bind = <T, U>(self: Maybe<T>, f: (input: T) => Maybe<U>): Maybe<U> => {
  switch (self.tag) {
    case 'JUST':
      return f(self.value);
    case 'NOTHING':
      return self;
  }
};

export const bind2 = <T, U>(self: Maybe<T>, f: (input: T) => U | null | undefined): Maybe<NonNullable<U>> =>
  bind(self, (inner) => from(f(inner)));

export const flatten = <T>(self: Maybe<Maybe<T>>): Maybe<T> => {
  switch (self.tag) {
    case 'JUST':
      return self.value;
    case 'NOTHING':
      return self;
  }
};

// Side effects
export const each = <T>(self: Maybe<T>, f: (input: T) => void): void => {
  switch (self.tag) {
    case 'JUST':
      f(self.value);
      break;
    case 'NOTHING':
    // do nothing
  }
};

// Unwrapping
export const or = <T>(self: Maybe<T>, other: Maybe<T>): Maybe<T> => {
  switch (self.tag) {
    case 'JUST':
      return self;
    case 'NOTHING':
      return other;
  }
};

export const orThunk = <T>(self: Maybe<T>, thunk: () => Maybe<T>): Maybe<T> => {
  switch (self.tag) {
    case 'JUST':
      return self;
    case 'NOTHING':
      return thunk();
  }
};

export const getOr = <T>(self: Maybe<T>, other: T): T => {
  switch (self.tag) {
    case 'JUST':
      return self.value;
    case 'NOTHING':
      return other;
  }
};

export const getOrDie = <T>(self: Maybe<T>): T => {
  switch (self.tag) {
    case 'JUST':
      return self.value;
    case 'NOTHING':
      throw new Error('Called getOrDie on Nothing');
  }
};

export const getOrThunk = <T>(self: Maybe<T>, thunk: () => T): T => {
  switch (self.tag) {
    case 'JUST':
      return self.value;
    case 'NOTHING':
      return thunk();
  }
};

export const getOrNull = <T>(self: Maybe<T>): T | null =>
  getOr(self, null);

export const getOrUndefined = <T>(self: Maybe<T>): T | undefined =>
  getOr(self, undefined);

// Traversable
export const exists = <T>(self: Maybe<T>, pred: (input: T) => boolean): boolean =>
  self.tag === 'JUST' && pred(self.value);

export const forAll = <T>(self: Maybe<T>, pred: (input: T) => boolean): boolean =>
  self.tag === 'NOTHING' || pred(self.value);

export const filter: {
  <T>(self: Maybe<T>, pred: (input: T) => boolean): Maybe<T>;
  <T, U extends T>(self: Maybe<T>, pred: (input: T) => input is U): Maybe<U>;
} = (self, pred) => {
  if (self.tag === 'JUST' && pred(self.value)) {
    return self;
  } else {
    return nothing;
  }
};

export const toArr = <T>(self: Maybe<T>): T[] => {
  switch (self.tag) {
    case 'JUST':
      return [ self.value ];
    case 'NOTHING':
      return [];
  }
};

// Comparators
export const is = <T>(self: Maybe<T>, other: T): boolean =>
  self.tag === 'JUST' && self.value === other;

export const equals = <T>(lhs: Maybe<T>, rhs: Maybe<T>): boolean => {
  if (lhs.tag === 'JUST' && rhs.tag === 'JUST') {
    return lhs.value === rhs.value;
  } else {
    return lhs.tag === 'NOTHING' && rhs.tag === 'NOTHING';
  }
};

export const equals_ = <T1, T2>(lhs: Maybe<T1>, rhs: Maybe<T2>, comparator: (lhs: T1, rhs: T2) => boolean): boolean => {
  if (lhs.tag === 'JUST' && rhs.tag === 'JUST') {
    return comparator(lhs.value, rhs.value);
  } else {
    return lhs.tag === 'NOTHING' && rhs.tag === 'NOTHING';
  }
};