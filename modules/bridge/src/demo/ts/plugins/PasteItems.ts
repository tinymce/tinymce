import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { }
};

export const registerPasteItems = () => {
  getDemoRegistry().addToggleButton('pastetext', {
    type: 'togglebutton',
    disabled: false,
    onSetup: (buttonApi) => {
      editor.on('PastePlainTextToggle', (e) => {
        buttonApi.setActive(e.state);
      });
      return () => { };
    },
    onAction: (_buttonApi) => {
      // toggles setting
    }
  });
};