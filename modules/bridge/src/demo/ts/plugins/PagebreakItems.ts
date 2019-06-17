import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerPageBreakItems = () => {
  getDemoRegistry().addButton('pagebreak', {
    type: 'button',
    disabled: false,
    onAction: (buttonApi) => {
      // inserts page break
    }
  });
};