import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerNonbreakingItems = () => {
  getDemoRegistry().addButton('nonbreaking', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // inserts nbsp
    }
  });
};