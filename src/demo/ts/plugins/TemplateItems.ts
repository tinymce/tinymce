import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerTemplateItems = () => {
  getDemoRegistry().addButton('template', {
    type: 'button',
    disabled: false,
    onAction: (buttonApi) => {
      // show dialog
    }
  });
};