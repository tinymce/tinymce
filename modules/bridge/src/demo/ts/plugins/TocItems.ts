import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (_s, _f) => { },
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
    onAction: (_buttonApi) => {
      // insert Table of contents
    }
  });
};