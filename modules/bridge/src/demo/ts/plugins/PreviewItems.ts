import { getDemoRegistry } from './../buttons/DemoRegistry';

export const registerPreviewItems = () => {
  getDemoRegistry().addButton('preview', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // launch preview
    }
  });
};