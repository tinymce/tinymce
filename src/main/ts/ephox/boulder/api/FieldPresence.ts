import { Adt, Fun } from '@ephox/katamari';

export interface FieldPresenceAdt {
  fold: (...args: any[]) => any;
  match: (branches: {any}) => any;
  log: (label: string) => string;
}

const adt = Adt.generate([
  { strict: [ ] },
  { defaultedThunk: [ 'fallbackThunk' ] },
  { asOption: [ ] },
  { asDefaultedOptionThunk: [ 'fallbackThunk' ] },
  { mergeWithThunk: [ 'baseThunk' ] }
]);

const defaulted = function (fallback: any): FieldPresenceAdt {
  return adt.defaultedThunk(
    Fun.constant(fallback)
  );
};

const asDefaultedOption = function <T>(fallback: T): FieldPresenceAdt {
  return adt.asDefaultedOptionThunk(
    Fun.constant(fallback)
  );
};

const mergeWith = function (base: {}): FieldPresenceAdt {
  return adt.mergeWithThunk(
    Fun.constant(base)
  );
};

const strict = adt.strict;
const asOption = adt.asOption;
const defaultedThunk = adt.defaultedThunk;
const asDefaultedOptionThunk = adt.asDefaultedOptionThunk;
const mergeWithThunk = adt.mergeWithThunk;

export {
  strict,
  asOption,

  defaulted,
  defaultedThunk,

  asDefaultedOption,
  asDefaultedOptionThunk,

  mergeWith,
  mergeWithThunk
};