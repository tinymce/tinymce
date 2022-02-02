/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Dialog from '../ui/Dialog';

export interface Api {
  readonly showDialog: () => void;
}

const get = (editor: Editor): Api => {
  const showDialog = () => {
    Dialog.showDialog(editor);
  };

  return {
    showDialog
  };
};

export {
  get
};
