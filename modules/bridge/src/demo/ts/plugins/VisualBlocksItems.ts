import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { },
  isDirty: Fun.always
};

export const registerVisualBlocksItems = (): void => {
  getDemoRegistry().addToggleButton('visualblocks', {
    type: 'togglebutton',
    disabled: false,
    onSetup: (buttonApi) => {
      editor.on('VisualBlocks', (e) => {
        buttonApi.setActive(e);
      });
      return Fun.noop;
    },
    onAction: (_buttonApi) => {
      // toggles visual blocks

    }
  });
};
