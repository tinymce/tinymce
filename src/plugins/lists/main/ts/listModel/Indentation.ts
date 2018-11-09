/**
 * Indentation.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Entry } from './Entry';

export const enum IndentValue {
  Indent = 'Indent',
  Outdent = 'Outdent',
  Flatten = 'Flatten'
}

export const indentEntry = (indentation: IndentValue, entry: Entry): void => {
  switch (indentation) {
    case IndentValue.Indent:
      entry.depth ++;
      break;

    case IndentValue.Outdent:
      entry.depth --;
      break;

    case IndentValue.Flatten:
      entry.depth = 0;
  }
};