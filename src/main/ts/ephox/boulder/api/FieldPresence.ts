import { Adt, Fun } from '@ephox/katamari';
import { EncodedAdt } from '../core/ValueProcessor';

const adt = Adt.generate([
  { strict: [ ] },
  { defaultedThunk: [ 'fallbackThunk' ] },
  { asOption: [ ] },
  { asDefaultedOptionThunk: [ 'fallbackThunk' ] },
  { mergeWithThunk: [ 'baseThunk' ] }
]);

const defaulted = function <a>(fallback: a): EncodedAdt {
  return adt.defaultedThunk(
    Fun.constant(fallback)
  );
};

const asDefaultedOption = function <a>(fallback: a): EncodedAdt {
  return adt.asDefaultedOptionThunk(
    Fun.constant(fallback)
  );
};

const mergeWith = function (base: {}): EncodedAdt {
  return adt.mergeWithThunk(
    Fun.constant(base)
  );
};

export default <any> {
  strict: adt.strict,
  asOption: adt.asOption,

  defaulted,
  defaultedThunk: adt.defaultedThunk,

  asDefaultedOption,
  asDefaultedOptionThunk: adt.asDefaultedOptionThunk,

  mergeWith,
  mergeWithThunk: adt.mergeWithThunk
};