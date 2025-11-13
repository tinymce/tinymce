
import type { Dialog } from 'tinymce/core/api/ui/Ui';

import type { LinkDialogInfo } from './DialogTypes';

const makeTab = (_info: LinkDialogInfo): Dialog.TabSpec => {
  const items: Dialog.BodyComponentSpec[] = [
    {
      type: 'dropzone',
      name: 'fileinput',
      buttonLabel: 'Browse for a file',
      dropAreaLabel: 'Drop an file here',
      allowedFiles: '*'
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
