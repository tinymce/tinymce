import {
  AlloyComponent,
  AlloyTriggers,
  Disabling,
  Representing,
  SystemEvents
} from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Singleton } from '@ephox/katamari';
import { Focus, SugarElement } from '@ephox/sugar';

import { backSlideEvent } from './ContextUi';

export const getFormApi = <T>(input: AlloyComponent, valueState: Singleton.Value<T>, focusfallbackElement?: SugarElement<HTMLElement>): InlineContent.ContextFormInstanceApi<T> => {
  return ({
    setInputEnabled: (state: boolean) => {
      if (!state && focusfallbackElement) {
        Focus.focus(focusfallbackElement);
      }

      Disabling.set(input, !state);
    },
    isInputEnabled: () => !Disabling.isDisabled(input),
    hide: () => {
      AlloyTriggers.emit(input, SystemEvents.sandboxClose());
    },
    back: () => {
      AlloyTriggers.emit(input, backSlideEvent);
    },
    getValue: () => {
      return valueState.get().getOrThunk(() => Representing.getValue(input));
    },
    setValue: (value) => {
      if (input.getSystem().isConnected()) {
        Representing.setValue(input, value);
      } else {
        valueState.set(value);
      }
    }
  });
};
