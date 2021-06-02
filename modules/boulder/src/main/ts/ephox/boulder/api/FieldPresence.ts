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

const strict = (): StrictData => ({ discriminator: 'strict', callback: { }});
const defaultedThunk = (fallbackThunk: Callback): DefaultedThunkData => ({ discriminator: 'defaultedThunk', callback: fallbackThunk });
const defaulted = <T>(fallback: T): DefaultedThunkData => defaultedThunk(Fun.constant(fallback));
const asOption = (): AsOptionData => ({ discriminator: 'asOption', callback: { }});
const asDefaultedOptionThunk = (fallbackThunk: Callback): AsDefaultedOptionThunkData => ({ discriminator: 'asDefaultedOptionThunk', callback: fallbackThunk });
const asDefaultedOption = <T>(fallback: T): AsDefaultedOptionThunkData => asDefaultedOptionThunk(Fun.constant(fallback));
const mergeWithThunk = (baseThunk: Callback): MergeWithThunkData => ({ discriminator: 'mergeWithThunk', callback: baseThunk });
const mergeWith = (base: {}): MergeWithThunkData => mergeWithThunk(Fun.constant(base));

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
