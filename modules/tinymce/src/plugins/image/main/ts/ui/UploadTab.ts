import type { Dialog } from 'tinymce/core/api/ui/Ui';

import type { ImageDialogInfo } from './DialogTypes';

const makeTab = (_info: ImageDialogInfo, onInvalidFiles: () => void): Dialog.TabSpec => {
  const items: Dialog.BodyComponentSpec[] = [
    {
      type: 'dropzone',
      name: 'fileinput',
      onInvalidFiles
    }
  ];
  return {
    title: 'Upload',
    name: 'upload',
    items
  };
};

export const UploadTab = {
  makeTab
};
