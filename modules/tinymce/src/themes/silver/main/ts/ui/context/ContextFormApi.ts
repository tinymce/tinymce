import {
  AlloyComponent,
  AlloyTriggers,
  Disabling,
  Representing,
  SystemEvents
} from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';

export const getFormApi = <T>(input: AlloyComponent): InlineContent.ContextFormInstanceApi<T> => ({
  setInputEnabled: (state: boolean) => Disabling.set(input, !state),
  isInputEnabled: () => !Disabling.isDisabled(input),
  hide: () => AlloyTriggers.emit(input, SystemEvents.sandboxClose()),
  getValue: () => Representing.getValue(input),
  setValue: (value) => Representing.setValue(input, value)
});

