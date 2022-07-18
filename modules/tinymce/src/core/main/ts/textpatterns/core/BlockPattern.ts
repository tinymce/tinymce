import { Arr, Obj, Optional, Type, Unicode } from '@ephox/katamari';

import * as TextSearch from '../../alien/TextSearch';
import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';
import Formatter from '../../api/Formatter';
import * as Options from '../../api/Options';
import Tools from '../../api/util/Tools';
import { generatePathRange, resolvePathRange } from '../utils/PathRange';
import * as Utils from '../utils/Utils';
import { getBlockPatterns } from './Pattern';
import { BlockPattern, BlockPatternMatch, Pattern, PatternSet } from './PatternTypes';

const stripPattern = (dom: DOMUtils, block: Node, pattern: BlockPattern): void => {
  // The pattern could be across fragmented text nodes, so we need to find the end
  // of the pattern and then remove all elements between the start/end range
  const firstTextNode = TextSearch.textAfter(block, 0, block);
  firstTextNode.each((spot) => {
    const node = spot.container;
    TextSearch.scanRight(node, pattern.start.length, block).each((end) => {
      const rng = dom.createRng();
      rng.setStart(node, 0);
      rng.setEnd(end.container, end.offset);

      Utils.deleteRng(dom, rng, (e: Node) => e === block);
    });
  });
};

const applyPattern = (editor: Editor, match: BlockPatternMatch): boolean => {
  const dom = editor.dom;
  const pattern = match.pattern;
  const rng = resolvePathRange(dom.getRoot(), match.range).getOrDie('Unable to resolve path range');

  const isBlockFormatName = (name: string, formatter: Formatter): boolean => {
    const formatSet = formatter.get(name);
    return Type.isArray(formatSet) && Arr.head(formatSet).exists((format) => Obj.has(format as any, 'block'));
  };

  Utils.getParentBlock(editor, rng).each((block) => {
    if (pattern.type === 'block-format') {
      if (isBlockFormatName(pattern.format, editor.formatter)) {
        editor.undoManager.transact(() => {
          stripPattern(editor.dom, block, pattern);
          editor.formatter.apply(pattern.format);
        });
      }
    } else if (pattern.type === 'block-command') {
      editor.undoManager.transact(() => {
        stripPattern(editor.dom, block, pattern);
        editor.execCommand(pattern.cmd, false, pattern.value);
      });
    }
  });

  return true;
};

// Finds a matching pattern to the specified text
const findPattern = <P extends Pattern>(patterns: P[], text: string): Optional<P> => {
  const nuText = text.replace(Unicode.nbsp, ' ');
  return Arr.find(patterns, (pattern) => text.indexOf(pattern.start) === 0 || nuText.indexOf(pattern.start) === 0);
};

const findPatterns = (editor: Editor, patternSet: PatternSet): BlockPatternMatch[] => {
  const dom = editor.dom;
  const rng = editor.selection.getRng();

  return Utils.getParentBlock(editor, rng).filter((block) => {
    const forcedRootBlock = Options.getForcedRootBlock(editor);
    const matchesForcedRootBlock = dom.is(block, forcedRootBlock);
    return block !== null && matchesForcedRootBlock;
  }).bind((block) => {
    // Get the block text
    const blockText = block.textContent ?? '';

    // TINY-8781: TODO: text_patterns should announce their changes for accessibility
    const extraPatterns = patternSet.dynamicPatternsLookup({
      text: blockText,
      block,
      // Block patterns do not allow trailing spaces currently. This is related to TINY-8779
      allowTrailingSpaces: false
    });
    // search in the dynamic patterns first
    const patterns = getBlockPatterns(extraPatterns);
    const matchedPattern = findPattern(patterns, blockText).orThunk(() => {
      // Search in the static patterns
      const patterns = getBlockPatterns(patternSet.blockPatterns);
      return findPattern(patterns, blockText);
    });

    return matchedPattern.map((pattern) => {
      if (Tools.trim(blockText).length === pattern.start.length) {
        return [];
      }

      return [{
        pattern,
        range: generatePathRange(dom.getRoot(), block, 0, block, 0)
      }];
    });
  }).getOr([]);
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

export { applyMatches, findPattern, findPatterns };
