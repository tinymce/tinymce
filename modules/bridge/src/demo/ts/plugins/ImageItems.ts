import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (s, f) => { },
  off: (s, f) => { }
};

export const registerImageItems = () => {
  getDemoRegistry().addToggleButton('image', {
    type: 'togglebutton',
    onSetup: (buttonApi) => {
      const f = (e) => buttonApi.setActive(e);
      editor.on('nodeChange', f);
      return () => editor.off('nodeChange', f);
    },
    onAction: (buttonApi) => {
      // show image dialog
    }
  });
};