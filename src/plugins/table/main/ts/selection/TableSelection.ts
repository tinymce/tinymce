/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const getSelectionStartFromSelector = (selector: string) => (editor: Editor) => Option.from(editor.dom.getParent(editor.selection.getStart(), selector)).map(Element.fromDom);

const getSelectionStartCaption = getSelectionStartFromSelector('caption');

const getSelectionStartCell = getSelectionStartFromSelector('th,td');

const getSelectionStartCellOrCaption = getSelectionStartFromSelector('th,td,caption');

export {
  getSelectionStartCaption,
  getSelectionStartCell,
  getSelectionStartCellOrCaption
};