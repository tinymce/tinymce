import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  isDirty: Fun.always
};

export const registerVisualCharsItems = (): void => {
  getDemoRegistry().addToggleButton('visualchars', {
    type: 'togglebutton',
    enabled: true,
    onSetup: (buttonApi) => {
      editor.on('VisualChars', (e: any) => {
        buttonApi.setActive(e);
      });
      return Fun.noop;
    },
    onAction: (_buttonApi) => {
      // toggles visual chars

    }
  });
};
