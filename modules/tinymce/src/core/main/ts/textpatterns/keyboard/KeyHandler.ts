import { Unicode } from '@ephox/katamari';

import { textBefore } from '../../alien/TextSearch';
import Editor from '../../api/Editor';
import VK from '../../api/util/VK';
import * as BlockPattern from '../core/BlockPattern';
import * as InlinePattern from '../core/InlinePattern';
import { InlinePatternSet, PatternSet } from '../core/PatternTypes';
import * as Utils from '../utils/Utils';

const handleEnter = (editor: Editor, patternSet: PatternSet): boolean => {
  // TINY-8779: The undoManager.extra() stores the content as a string and then set it back via setContent() which results in the fragmented text nodes being merged.
  // This causes a range error when the applying text pattern logic attempting to resolve the range to one of the fragmented text nodes that is no longer existed.
  // So call normalize() to merge fragmented text nodes before finding matching patterns
  // And because of an issue on safari https://bugs.webkit.org/show_bug.cgi?id=230594
  // we use bookmark to restore the selection after normalize()
  // TODO: Revisit this block of code after TINY-8909 is completed
  const bookmark = editor.selection.getBookmark(2, true);
  editor.getBody().normalize();
  editor.selection.moveToBookmark(bookmark);

  // Find any matches
  const inlineMatches = InlinePattern.findPatterns(editor, patternSet, false);
  const blockMatches = BlockPattern.findPatterns(editor, patternSet);
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

const handleInlineKey = (
  editor: Editor,
  patternSet: InlinePatternSet
): void => {
  const inlineMatches = InlinePattern.findPatterns(editor, patternSet, true);
  if (inlineMatches.length > 0) {
    editor.undoManager.transact(() => {
      InlinePattern.applyMatches(editor, inlineMatches);
    });
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
    return code === event.keyCode && !VK.modifierPressed(event);
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
