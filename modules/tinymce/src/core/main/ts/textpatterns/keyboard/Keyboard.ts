import { Cell } from '@ephox/katamari';

import Editor from '../../api/Editor';
import Delay from '../../api/util/Delay';
import VK from '../../api/util/VK';
import { PatternSet } from '../core/PatternTypes';
import * as KeyHandler from './KeyHandler';

const setup = (editor: Editor, patternsState: Cell<PatternSet>): void => {
  const charCodes = [ ',', '.', ';', ':', '!', '?' ];
  const keyCodes = [ 32 ];

  editor.on('keydown', (e) => {
    if (e.keyCode === 13 && !VK.modifierPressed(e)) {
      if (KeyHandler.handleEnter(editor, patternsState.get())) {
        e.preventDefault();
      }
    }
  }, true);

  editor.on('keyup', (e) => {
    if (KeyHandler.checkKeyCode(keyCodes, e)) {
      KeyHandler.handleInlineKey(editor, patternsState.get());
    }
  });

  editor.on('keypress', (e) => {
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
