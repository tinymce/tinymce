import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerPrintItems = () => {
  getDemoRegistry().addButton('print', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // trigger print
    }
  });
};