import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerCharmapItems = (): void => {
  getDemoRegistry().addButton('charmap', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // show charmap
    }
  });
};
