import { Arr, Optional } from '@ephox/katamari';
import { SugarText, SugarElement } from '@ephox/sugar';

import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';
import * as InlinePattern from '../core/InlinePattern';
import { PatternSet } from '../core/PatternTypes';
import * as Utils from '../utils/Utils';
import * as BlockPatternUtils from './BlockPatternUtils';
import { BlockPattern, BlockPatternMatch, InlinePatternMatch } from './PatternTypes';

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

const getMatches = (editor: Editor, patternSet: PatternSet): Optional<{ inlineMatches: InlinePatternMatch[]; blockMatches: BlockPatternMatch[] }> => {
  const rng = editor.selection.getRng();
  return Utils.getParentBlock(editor, rng).map((block) => {
    const offset = Math.max(0, rng.startOffset);
    const dynamicPatternSet = Utils.resolveFromDynamicPatterns(patternSet, block, block.textContent ?? '');
    // IMPORTANT: We need to get normalized match results since undoing and redoing the editor state
    // via undoManager.extra() will result in the DOM being normalized.
    const inlineMatches = InlinePattern.findPatterns(editor, block, rng.startContainer, offset, dynamicPatternSet, true);
    const blockMatches = findPatterns(editor, block, dynamicPatternSet, true);
    return { inlineMatches, blockMatches };
  }).filter(({ inlineMatches, blockMatches }) => blockMatches.length > 0 || inlineMatches.length > 0);
};

const applyMatches = (editor: Editor, matches: BlockPatternMatch[]): void => {
  if (matches.length === 0) {
    return;
  }

  // Store the current selection and then apply the matched patterns
  const bookmark = editor.selection.getBookmark();
  Arr.each(matches, (match) => applyPattern(editor, match));
  editor.selection.moveToBookmark(bookmark);
};

export { applyMatches, findPattern, findPatterns, getMatches };
