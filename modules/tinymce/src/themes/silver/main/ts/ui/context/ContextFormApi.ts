import {
  AlloyComponent,
  AlloyTriggers,
  Disabling,
  Representing,
  SystemEvents
} from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';

export const getFormApi = (input: AlloyComponent): InlineContent.ContextFormInstanceApi<any> => ({
  setInputEnabled: (state: boolean) => Disabling.set(input, !state),
  hide: () => AlloyTriggers.emit(input, SystemEvents.sandboxClose()),
  getValue: () => Representing.getValue(input),
  setValue: (value) => Representing.setValue(input, value)
});

