/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import * as InsertSpace from './InsertSpace';
import * as MatchKeys from './MatchKeys';
import { mockInputEvents } from './MockInputEvents';

const executeKeydownOverride = (editor: Editor, evt: KeyboardEvent) => {
  MatchKeys.execute([
    { keyCode: VK.SPACEBAR, action: MatchKeys.action(InsertSpace.insertSpaceOrNbspAtSelection, editor) }
  ], evt).each(mockInputEvents(editor, { inputType: 'insertText', data: ' ' }, evt));
};

const setup = (editor: Editor) => {
  editor.on('keydown', (evt: EditorEvent<KeyboardEvent>) => {
    if (evt.isDefaultPrevented() === false) {
      executeKeydownOverride(editor, evt);
    }
  });
};

export {
  setup
};
