import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerPreviewItems = (): void => {
  getDemoRegistry().addButton('preview', {
    type: 'button',
    disabled: false,
    onAction: (_buttonApi) => {
      // launch preview
    }
  });
};
