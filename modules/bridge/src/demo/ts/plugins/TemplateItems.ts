import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerTemplateItems = (): void => {
  getDemoRegistry().addButton('template', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // show dialog
    }
  });
};
