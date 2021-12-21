/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as Clipboard from './core/Clipboard';
import * as Commands from './core/Commands';
import * as CutCopy from './core/CutCopy';
import * as DragDrop from './core/DragDrop';
import { PasteBin } from './core/PasteBin';
import * as PrePostProcess from './core/PrePostProcess';
import * as Quirks from './core/Quirks';

const setup = (editor: Editor) => {
  const draggingInternallyState = Cell(false);
  const pasteFormat = Cell(Options.isPasteAsTextEnabled(editor) ? 'text' : 'html');
  const pasteBin = PasteBin(editor);

  Quirks.setup(editor);
  Commands.register(editor, pasteFormat);
  PrePostProcess.setup(editor);
  CutCopy.register(editor);
  DragDrop.setup(editor, draggingInternallyState);

  editor.on('init', () => {
    Clipboard.registerEventsAndFilters(editor, pasteBin, pasteFormat);
  });
};

export {
  setup
};
