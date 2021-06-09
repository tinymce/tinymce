import { Fun } from '@ephox/katamari';

export const enum FieldType {
  Strict = 'strict',
  DefaultedThunk = 'defaultedThunk',
  Option = 'option',
  DefaultedOptionThunk = 'defaultedOptionThunk',
  MergeWithThunk = 'mergeWithThunk'
}

type Callback = (...rest: any[]) => any;
interface FieldPresenceData<D extends FieldType, T> {
  readonly tag: D;
  readonly process: T;
}

type StrictData = FieldPresenceData<FieldType.Strict, {}>;
type DefaultedThunkData = FieldPresenceData<FieldType.DefaultedThunk, Callback>;
type OptionData = FieldPresenceData<FieldType.Option, {}>;
type DefaultedOptionThunkData = FieldPresenceData<FieldType.DefaultedOptionThunk, Callback>;
type MergeWithThunkData = FieldPresenceData<FieldType.MergeWithThunk, Callback>;

export type FieldPresence = StrictData | DefaultedThunkData | OptionData | DefaultedOptionThunkData | MergeWithThunkData;

const strict = (): StrictData => ({ tag: FieldType.Strict, process: { }});
const defaultedThunk = (fallbackThunk: Callback): DefaultedThunkData => ({ tag: FieldType.DefaultedThunk, process: fallbackThunk });
const defaulted = <T>(fallback: T): DefaultedThunkData => defaultedThunk(Fun.constant(fallback));
const asOption = (): OptionData => ({ tag: FieldType.Option, process: { }});
const asDefaultedOptionThunk = (fallbackThunk: Callback): DefaultedOptionThunkData => ({ tag: FieldType.DefaultedOptionThunk, process: fallbackThunk });
const asDefaultedOption = <T>(fallback: T): DefaultedOptionThunkData => asDefaultedOptionThunk(Fun.constant(fallback));
const mergeWithThunk = (baseThunk: Callback): MergeWithThunkData => ({ tag: FieldType.MergeWithThunk, process: baseThunk });
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
