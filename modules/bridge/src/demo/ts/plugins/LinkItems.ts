import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerLinkItems = () => {
  getDemoRegistry().addButton('link', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // open link dialog
    }
  });
};