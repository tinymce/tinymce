import { Dialog } from 'tinymce/core/api/ui/Ui';

import { ImageDialogInfo, ImageSourcePicker } from './DialogTypes';

const makeTab = (_info: ImageDialogInfo, pickers: ImageSourcePicker[]): Dialog.TabSpec => {
  const items: Dialog.BodyComponentSpec[] = [
    {
      type: 'dropzone',
      name: 'fileinput',
      pickers: pickers.map((sourcePicker) => {
        return {
          tooltip: sourcePicker.tooltip,
          icon: sourcePicker.icon,
          onPick: sourcePicker.onPick
        };
      })
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
