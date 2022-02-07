import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerPageBreakItems = (): void => {
  getDemoRegistry().addButton('pagebreak', {
    type: 'button',
    enabled: true,
    onAction: (_buttonApi) => {
      // inserts page break
    }
  });
};
