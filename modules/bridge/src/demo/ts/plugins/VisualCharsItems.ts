import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { },
  isDirty: Fun.always
};

export const registerVisualCharsItems = (): void => {
  getDemoRegistry().addToggleButton('visualchars', {
    type: 'togglebutton',
    disabled: false,
    onSetup: (buttonApi) => {
      editor.on('VisualChars', (e) => {
        buttonApi.setActive(e);
      });
      return Fun.noop;
    },
    onAction: (_buttonApi) => {
      // toggles visual chars

    }
  });
};
