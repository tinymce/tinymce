import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  isDirty: Fun.always
};

export const registerVisualBlocksItems = (): void => {
  getDemoRegistry().addToggleButton('visualblocks', {
    type: 'togglebutton',
    enabled: true,
    onSetup: (buttonApi) => {
      editor.on('VisualBlocks', (e: any) => {
        buttonApi.setActive(e);
      });
      return Fun.noop;
    },
    onAction: (_buttonApi) => {
      // toggles visual blocks

    }
  });
};
