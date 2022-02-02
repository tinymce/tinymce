import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { }
};

export const registerPasteItems = (): void => {
  getDemoRegistry().addToggleButton('pastetext', {
    type: 'togglebutton',
    disabled: false,
    onSetup: (buttonApi) => {
      editor.on('PastePlainTextToggle', (e) => {
        buttonApi.setActive(e.state);
      });
      return Fun.noop;
    },
    onAction: (_buttonApi) => {
      // toggles setting
    }
  });
};
