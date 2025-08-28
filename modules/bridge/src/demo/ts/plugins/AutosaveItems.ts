import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  off: (_s: string, _f: Function) => { }
};

export const registerAutosaveItems = (): void => {
  getDemoRegistry().addButton('restoredraft', {
    type: 'button',
    enabled: true,
    onSetup: (buttonApi) => {
      const editorOffCallback = (e: any) => {
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
