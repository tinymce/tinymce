/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as ArrowKeys from './ArrowKeys';
import * as BoundarySelection from './BoundarySelection';
import * as DeleteBackspaceKeys from './DeleteBackspaceKeys';
import * as EnterKey from './EnterKey';
import * as SpaceKey from './SpaceKey';
import * as CaretContainerInput from '../caret/CaretContainerInput';
import Editor from '../api/Editor';
import * as InputKeys from './InputKeys';
import * as HomeEndKeys from './HomeEndKeys';
import * as Rtc from '../Rtc';

const registerKeyboardOverrides = (editor: Editor) => {
  const caret = BoundarySelection.setupSelectedState(editor);

  CaretContainerInput.setup(editor);
  ArrowKeys.setup(editor, caret);
  DeleteBackspaceKeys.setup(editor, caret);
  EnterKey.setup(editor);
  SpaceKey.setup(editor);
  InputKeys.setup(editor);
  HomeEndKeys.setup(editor);
};

const setup = (editor: Editor): void => {
  if (!Rtc.isRtc(editor)) {
    registerKeyboardOverrides(editor);
  }
};

export {
  setup
};
