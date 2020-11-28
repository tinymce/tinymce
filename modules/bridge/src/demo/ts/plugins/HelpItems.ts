import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerHelpItems = (): void => {
  getDemoRegistry().addButton('help', {
    type: 'button',
    onAction: (_buttonApi) => {
      // show help
    }
  });
};
