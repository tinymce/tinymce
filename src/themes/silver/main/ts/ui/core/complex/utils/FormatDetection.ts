/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element } from '@ephox/dom-globals';
import { Arr, Option, Options } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';

const findNearest = (editor: Editor, getStyles, nodeChangeEvent) => {
  const parents: Element[] = nodeChangeEvent.parents;

  const styles = getStyles();

  return Options.findMap(parents, (parent) => {
    return Arr.find(styles, (fmt) => {
      return editor.formatter.matchNode(parent, fmt.format);
    });
  }).orThunk(() => {
    if (editor.formatter.match('p')) { return Option.some({title: 'Paragraph', format: 'p' }); }
    return Option.none();
  });
};

export {
  findNearest
};