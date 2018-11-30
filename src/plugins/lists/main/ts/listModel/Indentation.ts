/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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