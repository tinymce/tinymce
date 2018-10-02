import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (s, f) => { },
  off: (s, f) => { },
  isDirty: () => true
};

export const registerSaveItems = () => {
  getDemoRegistry().addButton('save', {
    type: 'button',
    disabled: false,
    onSetup: (buttonApi) => {
      const editorOffCallback = () => {
        buttonApi.setDisabled(editor.isDirty());
      };
      editor.on('nodeChange dirty', editorOffCallback);
      return () => editor.off('nodeChange dirty', editorOffCallback);
    },
    onAction: (buttonApi) => {
      // trigger save (or cancel)
    }
  });
};