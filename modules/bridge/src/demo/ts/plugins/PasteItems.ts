import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { }
};

export const registerPasteItems = (): void => {
  getDemoRegistry().addToggleButton('pastetext', {
    type: 'togglebutton',
    enabled: true,
    onSetup: (buttonApi) => {
      editor.on('PastePlainTextToggle', (e: any) => {
        buttonApi.setActive(e.state);
      });
      return Fun.noop;
    },
    onAction: (_buttonApi) => {
      // toggles setting
    }
  });
};
