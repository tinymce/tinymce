import type { Dialog } from 'tinymce/core/api/ui/Ui';

import type { ImageDialogInfo } from './DialogTypes';

const makeTab = (_info: ImageDialogInfo, errorHandler: (error: string) => void): Dialog.TabSpec => {
  const items: Dialog.BodyComponentSpec[] = [
    {
      type: 'dropzone',
      name: 'fileinput',
      errorHandler
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
