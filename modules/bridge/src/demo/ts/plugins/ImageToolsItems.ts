import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerImageToolsItems = () => {
  // Example, they are all the same.
  getDemoRegistry().addButton('rotateleft', {
    type: 'button',
    onAction: (buttonApi) => {
      // do whatever the action is
    }
  });
};