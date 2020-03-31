import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerCodeSampleItems = () => {
  getDemoRegistry().addButton('codesample', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // show code sample dialog
    }
  });
};