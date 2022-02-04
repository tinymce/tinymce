import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerNonbreakingItems = (): void => {
  getDemoRegistry().addButton('nonbreaking', {
    type: 'button',
    enabled: true,
    onAction: (_buttonApi) => {
      // inserts nbsp
    }
  });
};
