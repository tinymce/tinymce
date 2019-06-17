import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerCharmapItems = () => {
  getDemoRegistry().addButton('charmap', {
    type: 'button',
    disabled: false,
    onAction: (buttonApi) => {
      // show charmap
    }
  });
};