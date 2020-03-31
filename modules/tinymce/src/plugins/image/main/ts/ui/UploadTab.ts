/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ImageDialogInfo } from './DialogTypes';
import { Types } from '@ephox/bridge';

const makeTab = (_info: ImageDialogInfo) => {
  const items: Types.Dialog.BodyComponentApi[] = [
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