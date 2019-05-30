import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (s, f) => { },
  off: (s, f) => { }
};

export const registerAutosaveItems = () => {
  getDemoRegistry().addButton('restoredraft', {
    type: 'button',
    disabled: false,
    onSetup: (buttonApi) => {
      const editorOffCallback = (e) => {
        // Set the disabled state based on something
        const state = e;
        buttonApi.setDisabled(state);
      };
      editor.on('StoreDraft RestoreDraft RemoveDraft', editorOffCallback);
      return () => editor.off('StoreDraft RestoreDraft RemoveDraft', editorOffCallback);
    },
    onAction: (buttonApi) => {
      // apply restore draft command
    }
  });
};