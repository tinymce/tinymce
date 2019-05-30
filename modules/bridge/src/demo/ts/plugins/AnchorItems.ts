import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (s, f) => { },
  off: (s, f) => { }
};

export const registerAnchorItems = () => {
  getDemoRegistry().addToggleButton('anchor', {
    type: 'togglebutton',
    disabled: false,
    onSetup: (buttonApi) => {
      const f = (e) => {
        // Set the active state based on something
        const state = e;
        buttonApi.setActive(state);
      };
      editor.on('NodeChange', f);
      return () => editor.off('nodeChange', f);
    },
    onAction: (buttonApi) => {
      // apply anchor command
    }
  });
};