/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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