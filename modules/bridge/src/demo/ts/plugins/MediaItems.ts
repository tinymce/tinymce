import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { }
};

export const registerMediaItems = (): void => {
  getDemoRegistry().addToggleButton('media', {
    type: 'togglebutton',
    enabled: true,
    onSetup: (buttonApi) => {
      editor.on('NodeChange', (e: any) => {
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
