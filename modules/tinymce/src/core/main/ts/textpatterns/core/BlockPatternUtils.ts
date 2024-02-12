import { Arr, Obj, Optional, Type, Unicode } from '@ephox/katamari';

import * as TextSearch from '../../alien/TextSearch';
import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';
import Formatter from '../../api/Formatter';
import * as Options from '../../api/Options';
import Tools from '../../api/util/Tools';
import { generatePathRange, resolvePathRange } from '../utils/PathRange';
import * as Utils from '../utils/Utils';
import { BlockPattern, BlockPatternMatch, Pattern, PatternSet } from './PatternTypes';

type StripPattern = (dom: DOMUtils, block: Node, pattern: BlockPattern) => void;
type FindPattern = <P extends Pattern>(patterns: P[], text: string) => Optional<P>;

const stripPattern = (dom: DOMUtils, block: Node, pattern: BlockPattern): Optional<Text> => {
  // The pattern could be across fragmented text nodes, so we need to find the end
  // of the pattern and then remove all elements between the start/end range
  return TextSearch.textAfter(block, 0, block).map((spot) => {
    const node = spot.container;
    TextSearch.scanRight(node, pattern.start.length, block).each((end) => {
      const rng = dom.createRng();
      rng.setStart(node, 0);
      rng.setEnd(end.container, end.offset);

      Utils.deleteRng(dom, rng, (e: Node) => e === block);
    });
    return node;
  });
};

const createApplyPattern = (stripPattern: StripPattern) => (editor: Editor, match: BlockPatternMatch): boolean => {
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
const findPattern = (predicate: (pattern: Pattern, text: string, nuText: string) => boolean) => <P extends Pattern>(patterns: P[], text: string ): Optional<P> => {
  const sortedPatterns = sortPatterns(patterns);
  const nuText = text.replace(Unicode.nbsp, ' ');
  return Arr.find(sortedPatterns, (pattern) => predicate(pattern, text, nuText));
};

const createFindPatterns = (findPattern: FindPattern, skipFullMatch: boolean) => (editor: Editor, block: Element, patternSet: PatternSet, normalizedMatches: boolean, text = block.textContent ?? ''): BlockPatternMatch[] => {
  const dom = editor.dom;
  const forcedRootBlock = Options.getForcedRootBlock(editor);
  if (!dom.is(block, forcedRootBlock)) {
    return [];
  }

  return findPattern(patternSet.blockPatterns, text).map((pattern) => {
    if (skipFullMatch && Tools.trim(text).length === pattern.start.length) {
      return [];
    }

    return [{
      pattern,
      range: generatePathRange(dom, dom.getRoot(), block, 0, block, 0, normalizedMatches)
    }];
  }).getOr([]);
};

export { createApplyPattern, createFindPatterns, findPattern, stripPattern };
