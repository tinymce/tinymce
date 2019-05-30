import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerLinkItems = () => {
  getDemoRegistry().addButton('link', {
    type: 'button',
    disabled: false,
    onAction: (buttonApi) => {
      // open link dialog
    }
  });
};