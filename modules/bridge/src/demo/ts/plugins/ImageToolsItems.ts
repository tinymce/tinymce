import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerImageToolsItems = (): void => {
  // Example, they are all the same.
  getDemoRegistry().addButton('rotateleft', {
    type: 'button',
    onAction: (_buttonApi) => {
      // do whatever the action is
    }
  });
};
