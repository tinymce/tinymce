import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerCharmapItems = () => {
  getDemoRegistry().addButton('charmap', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // show charmap
    }
  });
};