import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerHelpItems = () => {
  getDemoRegistry().addButton('help', {
    type: 'button',
    onAction: (buttonApi) => {
      // show help
    }
  });
};