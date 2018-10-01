import { ImageDialogInfo } from './DialogTypes';

const makeTab = function (info: ImageDialogInfo) {
  return {
    title: 'Upload',
    type: 'form',
    items: [
      {
        type: 'dropzone',
        name: 'fileinput',
        flex: true
      }
    ]
  };
};

export const UploadTab = {
  makeTab
};