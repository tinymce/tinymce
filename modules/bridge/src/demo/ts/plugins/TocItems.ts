import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (s, f) => { },
  isDirty: () => true
};

export const registerTocItems = () => {
  getDemoRegistry().addButton('toc', {
    type: 'button',
    disabled: false,
    onSetup: (buttonApi) => {
      editor.on('LoadContent SetContent change', (e) => {
        buttonApi.setDisabled(e);
      });
      return () => { };
    },
    onAction: (buttonApi) => {
      // insert Table of contents
    }
  });
};