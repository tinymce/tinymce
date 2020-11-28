import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerPageBreakItems = (): void => {
  getDemoRegistry().addButton('pagebreak', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // inserts page break
    }
  });
};
