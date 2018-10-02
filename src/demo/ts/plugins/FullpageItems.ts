import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerFullpageItems = () => {
  getDemoRegistry().addButton('fullpage', {
    type: 'button',
    disabled: false,
    onAction: (buttonApi) => {
      // show dialog
    }
  });
};