import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerLinkItems = (): void => {
  getDemoRegistry().addButton('link', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // open link dialog
    }
  });
};
