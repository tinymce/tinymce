import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  off: (_s: string, _f: Function) => { },
  isDirty: Fun.always
};

export const registerSaveItems = (): void => {
  getDemoRegistry().addButton('save', {
    type: 'button',
    enabled: true,
    onSetup: (buttonApi) => {
      const editorOffCallback = () => {
        buttonApi.setEnabled(!editor.isDirty());
      };
      editor.on('NodeChange dirty', editorOffCallback);
      return () => editor.off('NodeChange dirty', editorOffCallback);
    },
    onAction: (_buttonApi) => {
      // trigger save (or cancel)
    }
  });
};
