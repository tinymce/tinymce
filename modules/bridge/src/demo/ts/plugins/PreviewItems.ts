import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerPreviewItems = (): void => {
  getDemoRegistry().addButton('preview', {
    type: 'button',
    enabled: true,
    onAction: (_buttonApi) => {
      // launch preview
    }
  });
};
