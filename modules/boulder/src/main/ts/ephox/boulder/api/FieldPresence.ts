import { Adt, Fun } from '@ephox/katamari';

export type StrictField<T> = () => T;
export type DefaultedThunkField<T> = (fallbackThunk: (...rest: any[]) => any) => T;
export type AsOptionField<T> = () => T;
export type AsDefaultedOptionThunkField<T> = (fallbackThunk: (...rest: any[]) => any) => T;
export type MergeWithThunkField<T> = (baseThunk: (...rest: any[]) => any) => T;
export interface FieldPresenceAdt {
  fold: <T>(
    strict: StrictField<T>,
    defaultedThunk: DefaultedThunkField<T>,
    asOption: AsOptionField<T>,
    asDefaultedOptionThunk: AsDefaultedOptionThunkField<T>,
    mergeWithThunk: MergeWithThunkField<T>
  ) => T;
  match: <T>(branches: {
    strict: StrictField<T>;
    defaultedThunk: DefaultedThunkField<T>;
    asOption: AsOptionField<T>,
    asDefaultedOptionThunk: AsDefaultedOptionThunkField<T>;
    mergeWithThunk: MergeWithThunkField<T>;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  strict: StrictField<FieldPresenceAdt>;
  defaultedThunk: DefaultedThunkField<FieldPresenceAdt>;
  asOption: AsOptionField<FieldPresenceAdt>;
  asDefaultedOptionThunk: MergeWithThunkField<FieldPresenceAdt>;
  mergeWithThunk: MergeWithThunkField<FieldPresenceAdt>;
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
