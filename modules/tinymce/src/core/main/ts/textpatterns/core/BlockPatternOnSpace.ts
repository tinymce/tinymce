import { Arr, Optional } from '@ephox/katamari';

import Editor from '../../api/Editor';
import { PatternSet } from '../core/PatternTypes';
import * as Utils from '../utils/Utils';
import * as BlockPatternUtils from './BlockPatternUtils';
import { BlockPatternMatch } from './PatternTypes';

const applyPattern = BlockPatternUtils.createApplyPattern(BlockPatternUtils.stripPattern);

const findPattern = BlockPatternUtils.findPattern((pattern, text, nuText) => text === pattern.start || nuText === pattern.start);

const findPatterns = BlockPatternUtils.createFindPatterns(findPattern, false);

const getMatches = (editor: Editor, patternSet: PatternSet): Optional<BlockPatternMatch[]> => {
  const rng = editor.selection.getRng();
  return Utils.getParentBlock(editor, rng).map((block) => {
    const offset = Math.max(0, rng.startOffset);
    const beforeText = Utils.getBeforeText(editor.dom, block, rng.startContainer, offset);
    const dynamicPatternSet = Utils.resolveFromDynamicPatterns(patternSet, block, beforeText);
    return findPatterns(editor, block, dynamicPatternSet, false, beforeText);
  }).filter((matches) => matches.length > 0);
};

const applyMatches = (editor: Editor, matches: BlockPatternMatch[]): void => {
  Arr.each(matches, (match) => applyPattern(editor, match));
};

export { applyMatches, findPattern, findPatterns, getMatches };
