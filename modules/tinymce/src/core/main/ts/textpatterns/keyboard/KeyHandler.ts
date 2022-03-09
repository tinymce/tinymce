import { Unicode } from '@ephox/katamari';

import { textBefore } from '../../alien/TextSearch';
import Editor from '../../api/Editor';
import VK from '../../api/util/VK';
import * as BlockPattern from '../core/BlockPattern';
import * as InlinePattern from '../core/InlinePattern';
import { InlinePattern as InlinePatternType, PatternSet } from '../core/PatternTypes';
import * as Utils from '../utils/Utils';

const hasPatterns = (patternSet: PatternSet): boolean =>
  patternSet.inlinePatterns.length > 0 || patternSet.blockPatterns.length > 0;

const handleEnter = (editor: Editor, patternSet: PatternSet): boolean => {
  // Skip checking when the selection isn't collapsed or we have no patterns
  if (!editor.selection.isCollapsed() || !hasPatterns(patternSet)) {
    return false;
  }

  // Find any matches
  const inlineMatches = InlinePattern.findPatterns(editor, patternSet.inlinePatterns, false);
  const blockMatches = BlockPattern.findPatterns(editor, patternSet.blockPatterns);
  if (blockMatches.length > 0 || inlineMatches.length > 0) {
    editor.undoManager.add();
    editor.undoManager.extra(
      () => {
        editor.execCommand('mceInsertNewLine');
      },
      () => {
        // create a cursor position that we can move to avoid the inline formats
        editor.insertContent(Unicode.zeroWidth);
        InlinePattern.applyMatches(editor, inlineMatches);
        BlockPattern.applyMatches(editor, blockMatches);
        // find the spot before the cursor position
        const range = editor.selection.getRng();
        const spot = textBefore(range.startContainer, range.startOffset, editor.dom.getRoot());
        editor.execCommand('mceInsertNewLine');
        // clean up the cursor position we used to preserve the format
        spot.each((s) => {
          const node = s.container;
          if (node.data.charAt(s.offset - 1) === Unicode.zeroWidth) {
            node.deleteData(s.offset - 1, 1);
            Utils.cleanEmptyNodes(editor.dom, node.parentNode, (e: Node) => e === editor.dom.getRoot());
          }
        });
      }
    );
    return true;
  }
  return false;
};

const handleInlineKey = (editor: Editor, inlinePatterns: InlinePatternType[]): void => {
  if (inlinePatterns.length > 0) {
    const inlineMatches = InlinePattern.findPatterns(editor, inlinePatterns, true);
    if (inlineMatches.length > 0) {
      editor.undoManager.transact(() => {
        InlinePattern.applyMatches(editor, inlineMatches);
      });
    }
  }
};

const checkKeyEvent = <T>(codes: T[], event: KeyboardEvent, predicate: (code: T, event: KeyboardEvent) => boolean): boolean => {
  for (let i = 0; i < codes.length; i++) {
    if (predicate(codes[i], event)) {
      return true;
    }
  }
  return false;
};

const checkKeyCode = (codes: number[], event: KeyboardEvent): boolean =>
  checkKeyEvent(codes, event, (code, event) => {
    return code === event.keyCode && VK.modifierPressed(event) === false;
  });

const checkCharCode = (chars: string[], event: KeyboardEvent): boolean =>
  checkKeyEvent(chars, event, (chr, event) => {
    return chr.charCodeAt(0) === event.charCode;
  });

export {
  handleEnter,
  handleInlineKey,
  checkCharCode,
  checkKeyCode
};
