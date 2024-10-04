import {
  AlloyComponent,
  AlloyTriggers,
  Representing,
  SystemEvents
} from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';

export const getFormApi = (input: AlloyComponent): InlineContent.ContextFormInstanceApi<any> => ({
  hide: () => AlloyTriggers.emit(input, SystemEvents.sandboxClose()),
  getValue: () => Representing.getValue(input),
  setValue: (value) => Representing.setValue(input, value)
});

