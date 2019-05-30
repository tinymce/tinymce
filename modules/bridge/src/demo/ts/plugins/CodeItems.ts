import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerCodeItems = () => {
  getDemoRegistry().addButton('code', {
    type: 'button',
    disabled: false,
    onAction: (buttonApi) => {
      // show code dialog
    }
  });
};