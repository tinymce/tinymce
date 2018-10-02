import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (s, f) => { },
  off: (s, f) => { }
};

export const registerDirectionalityItems = () => {
  getDemoRegistry().addToggleButton('dir', {
    type: 'togglebutton',
    disabled: false,
    onSetup: (buttonApi) => {
      const f = (e) => {
        buttonApi.setActive(e);
      };
      editor.on('nodeChange', f);
      return () => editor.off('nodeChange', f);
    },
    onAction: (buttonApi) => {
      // execute command direction LTR or RTL
    }
  });
};