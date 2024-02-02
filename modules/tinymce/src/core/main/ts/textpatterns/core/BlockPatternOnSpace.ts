import { Arr } from '@ephox/katamari';

import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';
import * as BlockPatternUtils from './BlockPatternUtils';
import { BlockPattern, BlockPatternMatch } from './PatternTypes';

const stripPattern = (dom: DOMUtils, block: Node, pattern: BlockPattern): void => {
  BlockPatternUtils.stripPattern(dom, block, pattern);
};

const applyPattern = BlockPatternUtils.createApplyPattern(stripPattern);

const findPattern = BlockPatternUtils.findPattern((pattern, text, nuText) => text === pattern.start || nuText === pattern.start);

const findPatterns = BlockPatternUtils.createFindPatterns(findPattern, false);

const applyMatches = (editor: Editor, matches: BlockPatternMatch[]): void => {
  if (matches.length === 0) {
    return;
  }

  Arr.each(matches, (match) => applyPattern(editor, match));
};

export { applyMatches, findPattern, findPatterns };
