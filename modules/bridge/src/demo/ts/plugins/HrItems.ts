import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerHrItems = () => {
  getDemoRegistry().addButton('hr', {
    type: 'button',
    onAction: (_buttonApi) => {
      // add hr to content
    }
  });
};