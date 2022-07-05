import { Fun } from '@ephox/katamari';

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import { clone } from '../events/EventUtils';

interface SpecificsInput {
  data?: null | string;
}

const createAndFireInputEvent = (eventType: string) =>
  (editor: Editor, inputType: string, specifics: SpecificsInput = {}): EditorEvent<InputEvent> => {
    const target = editor.getBody();
    const overrides = {
      bubbles: true,
      composed: true,
      data: null,
      isComposing: false,
      detail: 0,
      view: null,
      target,
      currentTarget: target,
      eventPhase: Event.AT_TARGET,
      originalTarget: target,
      explicitOriginalTarget: target,
      isTrusted: false,
      srcElement: target,
      cancelable: false,
      preventDefault: Fun.noop,
      inputType
    };

    const input = clone(new InputEvent(eventType));

    return editor.dispatch(eventType, { ...input, ...overrides, ...specifics });
  };

const fireFakeInputEvent = createAndFireInputEvent('input');

const fireFakeBeforeInputEvent = createAndFireInputEvent('beforeinput');

export {
  fireFakeInputEvent,
  fireFakeBeforeInputEvent
};
