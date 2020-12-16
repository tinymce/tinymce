/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import VK from 'tinymce/core/api/util/VK';
import { PatternSet } from '../core/PatternTypes';
import * as KeyHandler from './KeyHandler';

const setup = (editor: Editor, patternsState: Cell<PatternSet>) => {
  const charCodes = [ ',', '.', ';', ':', '!', '?' ];
  const keyCodes = [ 32 ];

  editor.on('keydown', (e: EditorEvent<KeyboardEvent>) => {
    if (e.keyCode === 13 && !VK.modifierPressed(e)) {
      if (KeyHandler.handleEnter(editor, patternsState.get())) {
        e.preventDefault();
      }
    }
  }, true);

  editor.on('keyup', (e: EditorEvent<KeyboardEvent>) => {
    if (KeyHandler.checkKeyCode(keyCodes, e)) {
      KeyHandler.handleInlineKey(editor, patternsState.get());
    }
  });

  editor.on('keypress', (e: EditorEvent<KeyboardEvent>) => {
    if (KeyHandler.checkCharCode(charCodes, e)) {
      Delay.setEditorTimeout(editor, () => {
        KeyHandler.handleInlineKey(editor, patternsState.get());
      });
    }
  });
};

export {
  setup
};
