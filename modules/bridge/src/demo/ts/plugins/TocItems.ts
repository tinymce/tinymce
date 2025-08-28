import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  off: (_s: string, _f: Function) => { },
  isDirty: Fun.always
};

export const registerTocItems = (): void => {
  getDemoRegistry().addButton('toc', {
    type: 'button',
    enabled: true,
    onSetup: (buttonApi) => {
      editor.on('LoadContent SetContent change', (e: any) => {
        buttonApi.setEnabled(!e);
      });
      return Fun.noop;
    },
    onAction: (_buttonApi) => {
      // insert Table of contents
    }
  });
};
