import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { },
  off: (_s, _f) => { }
};

export const registerDirectionalityItems = (): void => {
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
    onAction: (_buttonApi) => {
      // execute command direction LTR or RTL
    }
  });
};
