import Editor from '../../api/Editor';
import * as Options from '../../api/Options';
import Delay from '../../api/util/Delay';
import VK from '../../api/util/VK';
import * as Pattern from '../core/Pattern';
import * as KeyHandler from './KeyHandler';

const setup = (editor: Editor): void => {
  const charCodes = [ ',', '.', ';', ':', '!', '?' ];
  const keyCodes = [ 32 ];

  const isSelectionCollapsed = editor.selection.isCollapsed();

  // This is a thunk so that they reflect changes in the underlying options each time they are requested.
  const getPatternSet = () => Pattern.createPatternSet(
    Options.getTextPatterns(editor),
    Options.getTextPatternsLookup(editor)
  );

  // Only used for skipping text pattern matching altogether if nothing has been defined.
  const hasDynamicPatterns = () => Options.hasTextPatternsLookup(editor);

  editor.on('keydown', (e) => {
    if (e.keyCode === 13 && !VK.modifierPressed(e)) {
      const patternSet = getPatternSet();
      // Do not process anything if we don't have any inline patterns, block patterns,
      // or dynamic lookup defined
      const hasPatterns = patternSet.inlinePatterns.length > 0 ||
        patternSet.blockPatterns.length > 0 ||
        hasDynamicPatterns();

      if (!isSelectionCollapsed && hasPatterns && KeyHandler.handleEnter(editor, patternSet)) {
        e.preventDefault();
      }
    }
  }, true);

  const handleInlineTrigger = () => {
    const patternSet = getPatternSet();

    // Do not process anything if we don't have any inline patterns or dynamic lookup defined
    const hasPatterns = patternSet.inlinePatterns.length > 0 || hasDynamicPatterns();

    if (!isSelectionCollapsed && hasPatterns) {
      // Passing through just the part of PatternSet that is relevant for inline
      // patterns.
      KeyHandler.handleInlineKey(
        editor,
        {
          inlinePatterns: patternSet.inlinePatterns,
          dynamicPatternsLookup: patternSet.dynamicPatternsLookup
        }
      );
    }
  };

  editor.on('keyup', (e) => {
    if (KeyHandler.checkKeyCode(keyCodes, e)) {
      handleInlineTrigger();
    }
  });

  editor.on('keypress', (e) => {
    if (KeyHandler.checkCharCode(charCodes, e)) {
      Delay.setEditorTimeout(editor, handleInlineTrigger);
    }
  });
};

export {
  setup
};
