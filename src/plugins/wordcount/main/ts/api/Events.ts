/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Editor } from 'tinymce/core/api/Editor';
import { WordCount } from '../text/WordCount';

const fireWordCountUpdate = (editor: Editor, wordCount: WordCount) => {
  editor.fire('wordCountUpdate', { wordCount });
};

export {
  fireWordCountUpdate
};