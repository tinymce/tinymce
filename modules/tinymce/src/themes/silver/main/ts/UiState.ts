import { Behaviour, Channels, Disabling, Receiving } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { DisabledStateChangeEvent, NodeChangeEvent, SwitchModeEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as Options from './api/Options';
import { ReadyUiReferences } from './modes/UiReferences';

export const UiStateChannel = 'silver.uistate';

const messageSetDisabled = 'setDisabled';
const messageSetEnabled = 'setEnabled';
const messageInit = 'init';
const messageSwitchMode = 'switchmode';
const modeContextMessages = [ messageSwitchMode, messageInit ];

const broadcastEvents = (uiRefs: ReadyUiReferences, messageType: string): void => {
  const outerContainer = uiRefs.mainUi.outerContainer;
  const motherships = [ uiRefs.mainUi.mothership, ...uiRefs.uiMotherships ];

  if (messageType === messageSetDisabled) {
    Arr.each(motherships, (m) => {
      m.broadcastOn([ Channels.dismissPopups() ], { target: outerContainer.element });
    });
  }

  Arr.each(motherships, (m) => {
    m.broadcastOn([ UiStateChannel ], messageType);
  });
};

const setupEventsForUi = (editor: Editor, uiRefs: ReadyUiReferences): void => {
  editor.on('init SwitchMode', (event: EditorEvent<{ type: string } | SwitchModeEvent>) => {
    broadcastEvents(uiRefs, event.type);
  });

  editor.on('DisabledStateChange', (event: EditorEvent<DisabledStateChangeEvent>) => {
    if (!event.isDefaultPrevented()) {
      // When the event state indicates the editor is **enabled** (`event.state` is false),
      // we send an 'init' message instead of 'setEnabled' because the editor might be in read-only mode.
      // Sending 'setEnabled' would enable all the toolbar buttons, which is undesirable if the editor is read-only.
      const messageType = event.state ? messageSetDisabled : messageInit;
      broadcastEvents(uiRefs, messageType);

      // After refreshing the state of the buttons, trigger a NodeChange event.
      if (!event.state) {
        editor.nodeChanged();
      }
    }
  });

  editor.on('NodeChange', (e: EditorEvent<NodeChangeEvent>) => {
    const messageType = editor.ui.isEnabled() ? e.type : messageSetDisabled;
    broadcastEvents(uiRefs, messageType);
  });

  if (Options.isReadOnly(editor)) {
    editor.mode.set('readonly');
  }
};

const toggleOnReceive = (getContext: () => { contextType: string; shouldDisable: boolean }): Behaviour.NamedConfiguredBehaviour<any, any> => Receiving.config({
  channels: {
    [UiStateChannel]: {
      onReceive: (comp, messageType: string) => {
        if (messageType === messageSetDisabled || messageType === messageSetEnabled) {
          Disabling.set(comp, messageType === messageSetDisabled);
          return;
        }

        const { contextType, shouldDisable } = getContext();
        if (contextType === 'mode' && !Arr.contains(modeContextMessages, messageType)) {
          return;
        }

        Disabling.set(comp, shouldDisable);
      }
    }
  }
});

export {
  setupEventsForUi,
  toggleOnReceive,
  broadcastEvents
};
