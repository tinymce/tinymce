/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Dialog } from 'tinymce/core/api/ui/Ui';

import { ImageDialogInfo } from './DialogTypes';

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
