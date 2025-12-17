import { Arr } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import type { DocumentsFileTypes } from 'tinymce/core/api/OptionTypes';
import type { Dialog } from 'tinymce/core/api/ui/Ui';

const makeTab = (fileTypes: DocumentsFileTypes[], onInvalidFiles: (el: SugarElement<HTMLElement>) => void): Dialog.TabSpec => {
  const items: Dialog.BodyComponentSpec[] = [
    {
      type: 'dropzone',
      name: 'fileinput',
      buttonLabel: 'Browse for a file',
      dropAreaLabel: 'Drop a file here',
      allowedFileTypes: fileTypes.map((e) => e.mimeType).join(','),
      allowedFileExtensions: Arr.flatten(fileTypes.map((e) => e.extensions)),
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
