import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerListItems = (): void => {
  getDemoRegistry().addButton('indent', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // fires indent
    }
  });
};
