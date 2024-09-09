import { Behaviour, Disabling, Receiving } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent, SwitchModeEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { ReadyUiReferences } from './modes/UiReferences';

export interface SetEnabledEvent {
  readonly eventType: 'setEnabled';
  readonly shouldDisable: boolean;
}

export interface GenericEditorEvent {
  readonly eventType: string;
}

export type ButtonStateData = SetEnabledEvent | GenericEditorEvent;

export const ButtonStateChannel = 'silver.buttonstate';

const broadcastEvents = (uiRefs: ReadyUiReferences, data: ButtonStateData): void => {
  const motherships = [ uiRefs.mainUi.mothership, ...uiRefs.uiMotherships ];
  Arr.each(motherships, (m) => {
    m.broadcastOn([ ButtonStateChannel ], data);
  });
};

const setupEventsForButton = (editor: Editor, uiRefs: ReadyUiReferences): void => {
  editor.on('init SwitchMode', (e: EditorEvent<{} | SwitchModeEvent>) => {
    broadcastEvents(uiRefs, { eventType: e.type });
  });

  editor.on('NodeChange', (e: EditorEvent<NodeChangeEvent>) => {
    if (!editor.ui.isEnabled()) {
      broadcastEvents(uiRefs, { eventType: 'setEnabled', shouldDisable: true });
    } else {
      broadcastEvents(uiRefs, { eventType: e.type });
    }
  });
};

const isSetEnabledEvent = (event: ButtonStateData): event is SetEnabledEvent => event.eventType === 'setEnabled' && 'shouldDisable' in event;

const toggleOnReceive = (getContext: () => { contextType: string; shouldDisable: boolean }): Behaviour.NamedConfiguredBehaviour<any, any> => Receiving.config({
  channels: {
    [ButtonStateChannel]: {
      onReceive: (comp, buttonStateData: ButtonStateData) => {
        if (isSetEnabledEvent(buttonStateData)) {
          Disabling.set(comp, buttonStateData.shouldDisable);
          return;
        }

        const { contextType, shouldDisable: contextShouldDisable } = getContext();
        if (contextType === 'mode' && !Arr.contains([ 'switchmode', 'init' ], buttonStateData.eventType)) {
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
