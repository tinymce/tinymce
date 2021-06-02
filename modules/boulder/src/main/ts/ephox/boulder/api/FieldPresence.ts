import { Fun } from '@ephox/katamari';

type Callback = (...rest: any[]) => any;
interface FieldPresenceData<D, T> {
  readonly discriminator: D;
  readonly callback: T;
}

type StrictData = FieldPresenceData<'strict', {}>;
type DefaultedThunkData = FieldPresenceData<'defaultedThunk', Callback>;
type AsOptionData = FieldPresenceData<'asOption', {}>;
type AsDefaultedOptionThunkData = FieldPresenceData<'asDefaultedOptionThunk', Callback>;
type MergeWithThunkData = FieldPresenceData<'mergeWithThunk', Callback>;

export type FieldPresenceTypes = StrictData | DefaultedThunkData | AsOptionData | AsDefaultedOptionThunkData | MergeWithThunkData;

const constructors = {
  strict: (): StrictData => ({ discriminator: 'strict', callback: { }}),
  defaultedThunk: (fallbackThunk: Callback): DefaultedThunkData => ({ discriminator: 'defaultedThunk', callback: fallbackThunk }),
  asOption: (): AsOptionData => ({ discriminator: 'asOption', callback: { }}),
  asDefaultedOptionThunk: (fallbackThunk: Callback): AsDefaultedOptionThunkData => ({ discriminator: 'asDefaultedOptionThunk', callback: fallbackThunk }),
  mergeWithThunk: (baseThunk: Callback): MergeWithThunkData => ({ discriminator: 'mergeWithThunk', callback: baseThunk }),
};

const defaulted = <T>(fallback: T): DefaultedThunkData => constructors.defaultedThunk(Fun.constant(fallback));

const asDefaultedOption = <T>(fallback: T): AsDefaultedOptionThunkData => constructors.asDefaultedOptionThunk(Fun.constant(fallback));

const mergeWith = (base: {}): MergeWithThunkData => constructors.mergeWithThunk(Fun.constant(base));

const strict = constructors.strict;
const asOption = constructors.asOption;
const defaultedThunk = constructors.defaultedThunk;
const asDefaultedOptionThunk = constructors.asDefaultedOptionThunk;
const mergeWithThunk = constructors.mergeWithThunk;

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
