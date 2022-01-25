import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerTemplateItems = (): void => {
  getDemoRegistry().addButton('template', {
    type: 'button',
    enabled: true,
    onAction: (_buttonApi) => {
      // show dialog
    }
  });
};
