import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { },
  off: (_s, _f) => { }
};

export const registerAutosaveItems = (): void => {
  getDemoRegistry().addButton('restoredraft', {
    type: 'button',
    enabled: true,
    onSetup: (buttonApi) => {
      const editorOffCallback = (e) => {
        // Set the disabled state based on something
        const state = e;
        buttonApi.setEnabled(!state);
      };
      editor.on('StoreDraft RestoreDraft RemoveDraft', editorOffCallback);
      return () => editor.off('StoreDraft RestoreDraft RemoveDraft', editorOffCallback);
    },
    onAction: (_buttonApi) => {
      // apply restore draft command
    }
  });
};
