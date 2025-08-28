import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerCharmapItems = (): void => {
  getDemoRegistry().addButton('charmap', {
    type: 'button',
    enabled: true,
    onAction: (_buttonApi) => {
      // show charmap
    }
  });
};
