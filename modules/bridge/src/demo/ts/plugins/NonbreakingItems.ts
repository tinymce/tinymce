import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerNonbreakingItems = (): void => {
  getDemoRegistry().addButton('nonbreaking', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // inserts nbsp
    }
  });
};
