import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  off: (_s: string, _f: Function) => { }
};

export const registerAnchorItems = (): void => {
  getDemoRegistry().addToggleButton('anchor', {
    type: 'togglebutton',
    enabled: true,
    onSetup: (buttonApi) => {
      const f = (e: any) => {
        // Set the active state based on something
        const state = e;
        buttonApi.setActive(state);
      };
      editor.on('NodeChange', f);
      return () => editor.off('NodeChange', f);
    },
    onAction: (_buttonApi) => {
      // apply anchor command
    }
  });
};
