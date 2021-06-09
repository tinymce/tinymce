import { Fun } from '@ephox/katamari';

export const enum FieldTypes {
  Strict = 'strict',
  DefaultedThunk = 'defaultedThunk',
  AsOption = 'asOption',
  AsDefaultedOptionThunk = 'asDefaultedOptionThunk',
  MergeWithThunk = 'mergeWithThunk'
}

type Callback = (...rest: any[]) => any;
interface FieldPresenceData<D, T> {
  readonly discriminator: D;
  readonly callback: T;
}

type StrictData = FieldPresenceData<FieldTypes.Strict, {}>;
type DefaultedThunkData = FieldPresenceData<FieldTypes.DefaultedThunk, Callback>;
type AsOptionData = FieldPresenceData<FieldTypes.AsOption, {}>;
type AsDefaultedOptionThunkData = FieldPresenceData<FieldTypes.AsDefaultedOptionThunk, Callback>;
type MergeWithThunkData = FieldPresenceData<FieldTypes.MergeWithThunk, Callback>;

export type FieldPresenceTypes = StrictData | DefaultedThunkData | AsOptionData | AsDefaultedOptionThunkData | MergeWithThunkData;

const strict = Fun.constant<StrictData>({ discriminator: FieldTypes.Strict, callback: { }});
const defaultedThunk = (fallbackThunk: Callback): DefaultedThunkData => ({ discriminator: FieldTypes.DefaultedThunk, callback: fallbackThunk });
const defaulted = <T>(fallback: T): DefaultedThunkData => defaultedThunk(Fun.constant(fallback));
const asOption = Fun.constant<AsOptionData>({ discriminator: FieldTypes.AsOption, callback: { }});
const asDefaultedOptionThunk = (fallbackThunk: Callback): AsDefaultedOptionThunkData => ({ discriminator: FieldTypes.AsDefaultedOptionThunk, callback: fallbackThunk });
const asDefaultedOption = <T>(fallback: T): AsDefaultedOptionThunkData => asDefaultedOptionThunk(Fun.constant(fallback));
const mergeWithThunk = (baseThunk: Callback): MergeWithThunkData => ({ discriminator: FieldTypes.MergeWithThunk, callback: baseThunk });
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
