import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerHrItems = () => {
  getDemoRegistry().addButton('hr', {
    type: 'button',
    onAction: (buttonApi) => {
      // add hr to content
    }
  });
};