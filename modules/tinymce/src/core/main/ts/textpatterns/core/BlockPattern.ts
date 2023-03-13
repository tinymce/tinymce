import { Arr, Obj, Optional, Type, Unicode } from '@ephox/katamari';
import { SugarText, SugarElement } from '@ephox/sugar';

import * as TextSearch from '../../alien/TextSearch';
import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';
import Formatter from '../../api/Formatter';
import * as Options from '../../api/Options';
import Tools from '../../api/util/Tools';
import { generatePathRange, resolvePathRange } from '../utils/PathRange';
import * as Utils from '../utils/Utils';
import { BlockPattern, BlockPatternMatch, Pattern, PatternSet } from './PatternTypes';

const startsWithSingleSpace = (s: string): boolean => /^\s[^\s]/.test(s);

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

const sortPatterns = <P extends Pattern>(patterns: P[]): P[] =>
  Arr.sort(patterns, (a, b) => b.start.length - a.start.length);

// Finds a matching pattern to the specified text
const findPattern = <P extends Pattern>(patterns: P[], text: string): Optional<P> => {
  const sortedPatterns = sortPatterns(patterns);
  const nuText = text.replace(Unicode.nbsp, ' ');
  return Arr.find(sortedPatterns, (pattern) => text.indexOf(pattern.start) === 0 || nuText.indexOf(pattern.start) === 0);
};

const findPatterns = (editor: Editor, block: Element, patternSet: PatternSet, normalizedMatches: boolean): BlockPatternMatch[] => {
  const dom = editor.dom;
  const forcedRootBlock = Options.getForcedRootBlock(editor);
  if (!dom.is(block, forcedRootBlock)) {
    return [];
  }

  // Get the block text and then find a matching pattern
  const blockText = block.textContent ?? '';
  return findPattern(patternSet.blockPatterns, blockText).map((pattern) => {
    if (Tools.trim(blockText).length === pattern.start.length) {
      return [];
    }

    return [{
      pattern,
      range: generatePathRange(dom, dom.getRoot(), block, 0, block, 0, normalizedMatches)
    }];
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
