import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { },
  off: (_s, _f) => { }
};

export const registerImageItems = () => {
  getDemoRegistry().addToggleButton('image', {
    type: 'togglebutton',
    onSetup: (buttonApi) => {
      const f = (e) => buttonApi.setActive(e);
      editor.on('nodeChange', f);
      return () => editor.off('nodeChange', f);
    },
    onAction: (_buttonApi) => {
      // show image dialog
    }
  });
};