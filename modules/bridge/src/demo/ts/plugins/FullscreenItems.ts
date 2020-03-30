import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { },
  off: (_s, _f) => { }
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
    onAction: (_buttonApi) => {
      // show fullscreen
    }
  });
};