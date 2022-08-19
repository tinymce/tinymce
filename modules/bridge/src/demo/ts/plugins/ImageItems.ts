import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  off: (_s: string, _f: Function) => { }
};

export const registerImageItems = (): void => {
  getDemoRegistry().addToggleButton('image', {
    type: 'togglebutton',
    onSetup: (buttonApi) => {
      const f = (e: any) => buttonApi.setActive(e);
      editor.on('NodeChange', f);
      return () => editor.off('NodeChange', f);
    },
    onAction: (_buttonApi) => {
      // show image dialog
    }
  });
};
