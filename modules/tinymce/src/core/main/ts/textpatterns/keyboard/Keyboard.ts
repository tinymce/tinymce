import Editor from '../../api/Editor';
import * as Options from '../../api/Options';
import Delay from '../../api/util/Delay';
import VK from '../../api/util/VK';
import * as Pattern from '../core/Pattern';
import * as KeyHandler from './KeyHandler';

const setup = (editor: Editor): void => {
  const charCodes = [ ',', '.', ';', ':', '!', '?' ];
  const keyCodes = [ 32 ];

  const getPatternSet = () => Pattern.createPatternSet(Options.getTextPatterns(editor));
  const getInlinePatterns = () => Pattern.getInlinePatterns(Options.getTextPatterns(editor));

  editor.on('keydown', (e) => {
    if (e.keyCode === 13 && !VK.modifierPressed(e)) {
      if (KeyHandler.handleEnter(editor, getPatternSet())) {
        e.preventDefault();
      }
    }
  }, true);

  editor.on('keyup', (e) => {
    if (KeyHandler.checkKeyCode(keyCodes, e)) {
      KeyHandler.handleInlineKey(editor, getInlinePatterns());
    }
  });

  editor.on('keypress', (e) => {
    if (KeyHandler.checkCharCode(charCodes, e)) {
      Delay.setEditorTimeout(editor, () => {
        KeyHandler.handleInlineKey(editor, getInlinePatterns());
      });
    }
  });
};

export {
  setup
};
