import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { }
};

export const registerMediaItems = (): void => {
  getDemoRegistry().addToggleButton('media', {
    type: 'togglebutton',
    disabled: false,
    onSetup: (buttonApi) => {
      editor.on('nodeChange', (e) => {
        buttonApi.setActive(e);
        // sets active state based on selection
      });
      return Fun.noop;
    },
    onAction: (_buttonApi) => {
      // opens media dialog
    }
  });
};
