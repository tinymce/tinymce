import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (s, f) => { },
  off: (s, f) => { }
};

export const registerFullscreenItems = () => {
  getDemoRegistry().addToggleButton('fullscreen', {
    type: 'togglebutton',
    disabled: false,
    onSetup: (buttonApi) => {
      const f = (e) => {
        buttonApi.setActive(e.something);
      };
      editor.on('FullscreenStateChanged', f);
      return () => editor.off('FullscreenStateChanged', f);
    },
    onAction: (buttonApi) => {
      // show fullscreen
    }
  });
};