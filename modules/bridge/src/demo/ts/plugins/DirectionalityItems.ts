import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  off: (_s: string, _f: Function) => { }
};

export const registerDirectionalityItems = (): void => {
  getDemoRegistry().addToggleButton('dir', {
    type: 'togglebutton',
    enabled: true,
    onSetup: (buttonApi) => {
      const f = (e: any) => {
        buttonApi.setActive(e);
      };
      editor.on('NodeChange', f);
      return () => editor.off('NodeChange', f);
    },
    onAction: (_buttonApi) => {
      // execute command direction LTR or RTL
    }
  });
};
