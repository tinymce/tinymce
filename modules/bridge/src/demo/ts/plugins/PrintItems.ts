import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerPrintItems = () => {
  getDemoRegistry().addButton('print', {
    type: 'button',
    disabled: false,
    onAction: (buttonApi) => {
      // trigger print
    }
  });
};