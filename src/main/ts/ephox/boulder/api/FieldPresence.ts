import { Adt, Fun } from '@ephox/katamari';
import { AdtInterface } from '../alien/AdtDefinition';

export interface FieldPresenceAdt extends AdtInterface {
  // TODO: extend the correct fold type
  // fold: <T>(...fn: Array<(...x: any[]) => T>) => T;
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