import { Adt, Fun } from '@ephox/katamari';
import { EncodedAdt } from '../core/ValueProcessor';

const adt = Adt.generate([
  { strict: [ ] },
  { defaultedThunk: [ 'fallbackThunk' ] },
  { asOption: [ ] },
  { asDefaultedOptionThunk: [ 'fallbackThunk' ] },
  { mergeWithThunk: [ 'baseThunk' ] }
]);

const defaulted = function (fallback: any): any {
  return adt.defaultedThunk(
    Fun.constant(fallback)
  );
};

const asDefaultedOption = function <T>(fallback: T): EncodedAdt {
  return adt.asDefaultedOptionThunk(
    Fun.constant(fallback)
  );
};

const mergeWith = function (base: {}): EncodedAdt {
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