/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as WordCount from '../text/WordCount';
import { Editor } from 'tinymce/core/api/Editor';

const get = (editor: Editor) => {
  const getCount = () => {
    return WordCount.getEditorWordcount(editor).words;
  };

  return {
    getCount
  };
};

export {
  get
};