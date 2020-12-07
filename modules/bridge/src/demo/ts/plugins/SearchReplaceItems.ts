import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerSearchReplaceItems = (): void => {
  getDemoRegistry().addButton('searchreplace', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // trigger search replace dialog
    }
  });
};
