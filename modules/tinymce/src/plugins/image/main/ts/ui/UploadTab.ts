import type { Dialog } from 'tinymce/core/api/ui/Ui';

import type { ImageDialogInfo } from './DialogTypes';

const makeTab = (_info: ImageDialogInfo): Dialog.TabSpec => {
  const items: Dialog.BodyComponentSpec[] = [
    {
      type: 'dropzone',
      name: 'fileinput'
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
