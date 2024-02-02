import { Arr } from '@ephox/katamari';
import { SugarText, SugarElement } from '@ephox/sugar';

import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';
import * as BlockPatternUtils from './BlockPatternUtils';
import { BlockPattern, BlockPatternMatch } from './PatternTypes';

const startsWithSingleSpace = (s: string): boolean => /^\s[^\s]/.test(s);

const stripPattern = (dom: DOMUtils, block: Node, pattern: BlockPattern): void => {
  BlockPatternUtils.stripPattern(dom, block, pattern).each((node) => {
    /**
     * TINY-9603: If there is a single space between pattern.start and text (e.g. # 1)
     * then it will be left in the text content and then can appear in certain circumstances.
     * This is not an issue with multiple spaces because they are transformed to non-breaking ones.
     *
     * In this specific case we've decided to remove this single space whatsoever
     * as it feels to be the expected behavior.
     */
    const text = SugarElement.fromDom(node);
    const textContent = SugarText.get(text);
    if (startsWithSingleSpace(textContent)) {
      SugarText.set(text, textContent.slice(1));
    }
  });
};

const applyPattern = BlockPatternUtils.createApplyPattern(stripPattern);

const findPattern = BlockPatternUtils.findPattern((pattern, text, nuText) => text.indexOf(pattern.start) === 0 || nuText.indexOf(pattern.start) === 0);

const findPatterns = BlockPatternUtils.createFindPatterns(findPattern, true);

const applyMatches = (editor: Editor, matches: BlockPatternMatch[]): void => {
  if (matches.length === 0) {
    return;
  }

  // Store the current selection and then apply the matched patterns
  const bookmark = editor.selection.getBookmark();
  Arr.each(matches, (match) => applyPattern(editor, match));
  editor.selection.moveToBookmark(bookmark);
};

export { applyMatches, findPattern, findPatterns };
