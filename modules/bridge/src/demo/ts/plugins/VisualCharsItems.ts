import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { },
  isDirty: () => true
};

export const registerVisualCharsItems = () => {
  getDemoRegistry().addToggleButton('visualchars', {
    type: 'togglebutton',
    disabled: false,
    onSetup: (buttonApi) => {
      editor.on('VisualChars', (e) => {
        buttonApi.setActive(e);
      });
      return () => { };
    },
    onAction: (_buttonApi) => {
      // toggles visual chars

    }
  });
};