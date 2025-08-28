import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerLinkItems = (): void => {
  getDemoRegistry().addButton('link', {
    type: 'button',
    enabled: true,
    onAction: (_buttonApi) => {
      // open link dialog
    }
  });
};
