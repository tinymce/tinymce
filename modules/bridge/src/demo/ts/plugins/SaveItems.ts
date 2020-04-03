import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { },
  off: (_s, _f) => { },
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
    onAction: (_buttonApi) => {
      // trigger save (or cancel)
    }
  });
};