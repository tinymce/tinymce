import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { },
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
    onAction: (_buttonApi) => {
      // toggles visual blocks

    }
  });
};