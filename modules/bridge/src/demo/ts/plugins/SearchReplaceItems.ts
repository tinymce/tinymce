import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerSearchReplaceItems = (): void => {
  getDemoRegistry().addButton('searchreplace', {
    type: 'button',
    enabled: true,
    onAction: (_buttonApi) => {
      // trigger search replace dialog
    }
  });
};
