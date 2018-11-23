/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Delay from 'tinymce/core/api/util/Delay';
import VK from 'tinymce/core/api/util/VK';
import KeyHandler from './KeyHandler';
import { PatternSet } from '../api/Pattern';
import { Cell } from '@ephox/katamari';

const setup = function (editor, patternsState: Cell<PatternSet>) {
  const charCodes = [',', '.', ';', ':', '!', '?'];
  const keyCodes = [32];

  editor.on('keydown', function (e) {
    if (e.keyCode === 13 && !VK.modifierPressed(e)) {
      KeyHandler.handleEnter(editor, patternsState.get());
    }
  }, true);

  editor.on('keyup', function (e) {
    if (KeyHandler.checkKeyCode(keyCodes, e)) {
      KeyHandler.handleInlineKey(editor, patternsState.get());
    }
  });

  editor.on('keypress', function (e) {
    if (KeyHandler.checkCharCode(charCodes, e)) {
      Delay.setEditorTimeout(editor, function () {
        KeyHandler.handleInlineKey(editor, patternsState.get());
      });
    }
  });
};

export default {
  setup
};