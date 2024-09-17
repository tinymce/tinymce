import { Behaviour, Channels, Disabling, Receiving } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent, SwitchModeEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as Options from './api/Options';
import { ReadyUiReferences } from './modes/UiReferences';

export const UiStateChannel = 'silver.uistate';

const broadcastEvents = (uiRefs: ReadyUiReferences, data: string): void => {
  const outerContainer = uiRefs.mainUi.outerContainer;
  const target = outerContainer.element;
  const motherships = [ uiRefs.mainUi.mothership, ...uiRefs.uiMotherships ];

  if (data === 'setDisabled') {
    Arr.each(motherships, (m) => {
      m.broadcastOn([ Channels.dismissPopups() ], { target });
    });
  }

  Arr.each(motherships, (m) => {
    m.broadcastOn([ UiStateChannel ], data);
  });
};

const setupEventsForUi = (editor: Editor, uiRefs: ReadyUiReferences): void => {
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

  if (Options.isReadOnly(editor)) {
    editor.mode.set('readonly');
  }
};

const toggleOnReceive = (getContext: () => { contextType: string; shouldDisable: boolean }): Behaviour.NamedConfiguredBehaviour<any, any> => Receiving.config({
  channels: {
    [UiStateChannel]: {
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
  setupEventsForUi,
  toggleOnReceive,
  broadcastEvents
};
