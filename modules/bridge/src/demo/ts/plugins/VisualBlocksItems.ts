import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (s, f) => { },
  isDirty: () => true
};

export const registerVisualBlocksItems = () => {
  getDemoRegistry().addToggleButton('visualblocks', {
    type: 'togglebutton',
    disabled: false,
    onSetup: (buttonApi) => {
      editor.on('VisualBlocks', (e) => {
        buttonApi.setActive(e);
      });
      return () => { };
    },
    onAction: (buttonApi) => {
      // toggles visual blocks

    }
  });
};