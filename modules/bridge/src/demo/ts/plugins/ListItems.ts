import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerListItems = (): void => {
  getDemoRegistry().addButton('indent', {
    type: 'button',
    enabled: true,
    onAction: (_buttonApi) => {
      // fires indent
    }
  });
};
