import { Fun } from '@ephox/katamari';

export const enum FieldType {
  Required = 'required',
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

type RequiredData = FieldPresenceData<FieldType.Required, {}>;
type DefaultedThunkData = FieldPresenceData<FieldType.DefaultedThunk, Callback>;
type OptionData = FieldPresenceData<FieldType.Option, {}>;
type DefaultedOptionThunkData = FieldPresenceData<FieldType.DefaultedOptionThunk, Callback>;
type MergeWithThunkData = FieldPresenceData<FieldType.MergeWithThunk, Callback>;

export type FieldPresence = RequiredData | DefaultedThunkData | OptionData | DefaultedOptionThunkData | MergeWithThunkData;

const required = (): RequiredData => ({ tag: FieldType.Required, process: { }});
const defaultedThunk = (fallbackThunk: Callback): DefaultedThunkData => ({ tag: FieldType.DefaultedThunk, process: fallbackThunk });
const defaulted = <T>(fallback: T): DefaultedThunkData => defaultedThunk(Fun.constant(fallback));
const asOption = (): OptionData => ({ tag: FieldType.Option, process: { }});
const asDefaultedOptionThunk = (fallbackThunk: Callback): DefaultedOptionThunkData => ({ tag: FieldType.DefaultedOptionThunk, process: fallbackThunk });
const asDefaultedOption = <T>(fallback: T): DefaultedOptionThunkData => asDefaultedOptionThunk(Fun.constant(fallback));
const mergeWithThunk = (baseThunk: Callback): MergeWithThunkData => ({ tag: FieldType.MergeWithThunk, process: baseThunk });
const mergeWith = (base: {}): MergeWithThunkData => mergeWithThunk(Fun.constant(base));

export {
  required,
  asOption,

  defaulted,
  defaultedThunk,

  asDefaultedOption,
  asDefaultedOptionThunk,

  mergeWith,
  mergeWithThunk
};
