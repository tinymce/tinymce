import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerCodeItems = (): void => {
  getDemoRegistry().addButton('code', {
    type: 'button',
    enabled: true,
    onAction: (_buttonApi) => {
      // show code dialog
    }
  });
};
