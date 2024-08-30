import { Behaviour, Disabling, Receiving } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { ReadyUiReferences } from './modes/UiReferences';

export const ButtonStateChannel = 'silver.buttonstate';

const broadcastEvents = (uiRefs: ReadyUiReferences): void => {
  const motherships = [ uiRefs.mainUi.mothership, ...uiRefs.uiMotherships ];
  Arr.each(motherships, (m) => {
    m.broadcastOn([ ButtonStateChannel ], '');
  });
};

const setupEventsForButton = (editor: Editor, uiRefs: ReadyUiReferences): void => {
  editor.on('init', () => {
    broadcastEvents(uiRefs);
  });

  editor.on('SwitchMode', () => {
    broadcastEvents(uiRefs);
  });

  editor.on('NodeChange', () => {
    broadcastEvents(uiRefs);
  });
};

const toggleButtonStateOnReceive = (shouldDisable: () => boolean): Behaviour.NamedConfiguredBehaviour<any, any> => Receiving.config({
  channels: {
    [ButtonStateChannel]: {
      onReceive: (comp) => {
        Disabling.set(comp, shouldDisable());
      }
    }
  }
});

export {
  setupEventsForButton,
  toggleButtonStateOnReceive
};
