import { Adt, Fun } from '@ephox/katamari';

export type StrictField = () => any;
export type DefaultedThunkField = (fallbackThunk: (any) => any) => any;
export type AsOptionField = () => any;
export type AsDefaultedOptionThunkField = (fallbackThunk: (any) => any) => any;
export type MergeWithThunkField = (baseThunk: (any) => {any}) => any;
export interface FieldPresenceAdt extends Adt {
  // TODO: extend the correct fold type
  fold<T>(StrictField, DefaultedThunkField, AsOptionField, AsDefaultedOptionThunkField, MergeWithThunkField): T;
}

const adt: {
  strict: () => FieldPresenceAdt;
  defaultedThunk: (fallbackThunk: Function) => FieldPresenceAdt;
  asOption: () => FieldPresenceAdt;
  asDefaultedOptionThunk: (fallbackThunk: Function) => FieldPresenceAdt;
  mergeWithThunk: (baseThunk) => FieldPresenceAdt;
} = Adt.generate([
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