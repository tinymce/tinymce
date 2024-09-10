import { Behaviour, Disabling, Receiving } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent, SwitchModeEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { ReadyUiReferences } from './modes/UiReferences';

export const ButtonStateChannel = 'silver.buttonstate';

const broadcastEvents = (uiRefs: ReadyUiReferences, data: string): void => {
  const motherships = [ uiRefs.mainUi.mothership, ...uiRefs.uiMotherships ];
  Arr.each(motherships, (m) => {
    m.broadcastOn([ ButtonStateChannel ], data);
  });
};

const setupEventsForButton = (editor: Editor, uiRefs: ReadyUiReferences): void => {
  editor.on('init SwitchMode', (e: EditorEvent<{} | SwitchModeEvent>) => {
    broadcastEvents(uiRefs, e.type);
  });

  editor.on('NodeChange', (e: EditorEvent<NodeChangeEvent>) => {
    if (!editor.ui.isEnabled()) {
      broadcastEvents(uiRefs, 'setDisabled');
    } else {
      broadcastEvents(uiRefs, e.type);
    }
  });
};

const toggleOnReceive = (getContext: () => { contextType: string; shouldDisable: boolean }): Behaviour.NamedConfiguredBehaviour<any, any> => Receiving.config({
  channels: {
    [ButtonStateChannel]: {
      onReceive: (comp, buttonStateData: string) => {
        if (buttonStateData === 'setDisabled' || buttonStateData === 'setEnabled') {
          Disabling.set(comp, buttonStateData === 'setDisabled');
          return;
        }

        const { contextType, shouldDisable: contextShouldDisable } = getContext();
        if (contextType === 'mode' && !Arr.contains([ 'switchmode', 'init' ], buttonStateData)) {
          return;
        }

        Disabling.set(comp, contextShouldDisable);
      }
    }
  }
});

export {
  setupEventsForButton,
  toggleOnReceive,
  broadcastEvents
};
