import { Behaviour, Disabling, Receiving } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent, SwitchModeEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { ReadyUiReferences } from './modes/UiReferences';

export const ButtonStateChannel = 'silver.buttonstate';

const broadcastEvents = (uiRefs: ReadyUiReferences, eventType: string): void => {
  const motherships = [ uiRefs.mainUi.mothership, ...uiRefs.uiMotherships ];
  Arr.each(motherships, (m) => {
    m.broadcastOn([ ButtonStateChannel ], eventType);
  });
};

const setupEventsForButton = (editor: Editor, uiRefs: ReadyUiReferences): void => {
  editor.on('init SwitchMode NodeChange', (e: EditorEvent<{} | NodeChangeEvent | SwitchModeEvent>) => {
    broadcastEvents(uiRefs, e.type);
  });
};

const toggleOnReceive = (getContext: () => { contextType: string; shouldDisable: boolean }): Behaviour.NamedConfiguredBehaviour<any, any> => Receiving.config({
  channels: {
    [ButtonStateChannel]: {
      onReceive: (comp, eventType: string) => {
        const { contextType, shouldDisable } = getContext();
        if (contextType === 'mode') {
          if (Arr.contains([ 'switchmode' ], eventType)) {
            Disabling.set(comp, shouldDisable);
          }
        } else {
          Disabling.set(comp, shouldDisable);
        }
      }
    }
  }
});

export {
  setupEventsForButton,
  toggleOnReceive
};
