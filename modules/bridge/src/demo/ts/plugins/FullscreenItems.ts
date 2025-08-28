import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  off: (_s: string, _f: Function) => { }
};

export const registerFullscreenItems = (): void => {
  getDemoRegistry().addToggleButton('fullscreen', {
    type: 'togglebutton',
    enabled: true,
    onSetup: (buttonApi) => {
      const f = (e: any) => {
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
