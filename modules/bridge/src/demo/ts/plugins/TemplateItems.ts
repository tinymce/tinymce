import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerTemplateItems = () => {
  getDemoRegistry().addButton('template', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // show dialog
    }
  });
};