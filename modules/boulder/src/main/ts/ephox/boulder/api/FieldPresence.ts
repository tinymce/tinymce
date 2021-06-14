import { Fun } from '@ephox/katamari';

export const enum FieldPresenceTag {
  Required = 'required',
  DefaultedThunk = 'defaultedThunk',
  Option = 'option',
  DefaultedOptionThunk = 'defaultedOptionThunk',
  MergeWithThunk = 'mergeWithThunk'
}

type Callback = (...rest: any[]) => any;
interface FieldPresenceData<D extends FieldPresenceTag, T> {
  readonly tag: D;
  readonly process: T;
}

type RequiredData = FieldPresenceData<FieldPresenceTag.Required, {}>;
type DefaultedThunkData = FieldPresenceData<FieldPresenceTag.DefaultedThunk, Callback>;
type OptionData = FieldPresenceData<FieldPresenceTag.Option, {}>;
type DefaultedOptionThunkData = FieldPresenceData<FieldPresenceTag.DefaultedOptionThunk, Callback>;
type MergeWithThunkData = FieldPresenceData<FieldPresenceTag.MergeWithThunk, Callback>;

export type FieldPresence = RequiredData | DefaultedThunkData | OptionData | DefaultedOptionThunkData | MergeWithThunkData;

const required = (): RequiredData => ({ tag: FieldPresenceTag.Required, process: { }});
const defaultedThunk = (fallbackThunk: Callback): DefaultedThunkData => ({ tag: FieldPresenceTag.DefaultedThunk, process: fallbackThunk });
const defaulted = <T>(fallback: T): DefaultedThunkData => defaultedThunk(Fun.constant(fallback));
const asOption = (): OptionData => ({ tag: FieldPresenceTag.Option, process: { }});
const asDefaultedOptionThunk = (fallbackThunk: Callback): DefaultedOptionThunkData => ({ tag: FieldPresenceTag.DefaultedOptionThunk, process: fallbackThunk });
const asDefaultedOption = <T>(fallback: T): DefaultedOptionThunkData => asDefaultedOptionThunk(Fun.constant(fallback));
const mergeWithThunk = (baseThunk: Callback): MergeWithThunkData => ({ tag: FieldPresenceTag.MergeWithThunk, process: baseThunk });
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
