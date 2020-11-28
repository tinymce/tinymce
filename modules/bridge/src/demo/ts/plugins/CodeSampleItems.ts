import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerCodeSampleItems = (): void => {
  getDemoRegistry().addButton('codesample', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // show code sample dialog
    }
  });
};
