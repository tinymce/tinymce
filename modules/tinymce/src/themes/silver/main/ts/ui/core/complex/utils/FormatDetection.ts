/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional, Optionals } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { BasicSelectItem } from '../SelectDatasets';

export const findNearest = (editor: Editor, getStyles: () => BasicSelectItem[]) => {
  const styles = getStyles();
  const formats = Arr.map(styles, (style) => style.format);

  return Optional.from(editor.formatter.closest(formats)).bind((fmt) =>
    Arr.find(styles, (data) => data.format === fmt)
  ).orThunk(() => Optionals.someIf(editor.formatter.match('p'), { title: 'Paragraph', format: 'p' }));
};
