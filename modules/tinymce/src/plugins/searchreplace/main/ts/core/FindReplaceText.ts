/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, HTMLElement, Text as DOMText } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import { Arr, Cell, Option } from '@ephox/katamari';
import { Element, Attr, Insert, Class, Text, Remove } from '@ephox/sugar';

interface Match {
  searchText: string;
  startIndex: number;
  endIndex: number;
  matchNum: number;
}

const generateMatchMarker = (): Element<HTMLElement> => {
  const marker = Element.fromTag('span');
  Attr.set(marker, 'data-mce-bogus', 1);
  Class.add(marker, 'mce-match-marker');
  return marker;
};

const generateReplacementNode = (match: Match): Element<HTMLElement> => {
  const node = generateMatchMarker();
  Attr.set(node, 'data-mce-index', match.matchNum.toString());
  Insert.append(node, Element.fromText(match.searchText));
  return node;
};

const getMatches = (textNode: Element<DOMText>, regex: RegExp, matchCount: Cell<number>): Match[] => {
  let m: RegExpExecArray | RegExpMatchArray;
  const matches = [];
  const text = Text.get(textNode);

  const mapResult = (m: RegExpExecArray | RegExpMatchArray) => (
    {
      searchText: m[0],
      startIndex: m.index,
      endIndex: m.index + m[0].length,
      matchNum: matchCount.get()
    }
  );

  if (regex.global) {
    while ((m = regex.exec(text))) {
      matches.push(mapResult(m));
      matchCount.set(matchCount.get() + 1);
    }
  } else {
    m = text.match(regex);
    matches.push(mapResult(m));
    matchCount.set(matchCount.get() + 1);
  }

  return matches;
};

type RelatedMatches = {
  prevMatch: Option<Match>;
  match: Match;
  nextMatch: Option<Match>;
};

const nodeInSelection = (editor: Editor, textNode: Element<DOMText>): boolean => {
  const rng = editor.selection.getRng();
  const selectionRng = editor.dom.createRng();
  selectionRng.setStart(textNode.dom(), 0);
  selectionRng.setEnd(textNode.dom(), textNode.dom().length);
  // Check if the match is outside the selection
  if (rng.compareBoundaryPoints(Range.START_TO_START, selectionRng) !== -1 || rng.compareBoundaryPoints(Range.END_TO_END, selectionRng) !== 1) {
    return false;
  }

  return true;
};

const insertReplacementNode = (matches: RelatedMatches, textNode: Element<DOMText>) => {
  const { prevMatch, match, nextMatch } = matches;
  const replacementNode = generateReplacementNode(match);

  // Add `before` text node (before the match) - this only needs to be done once per text node
  if (prevMatch.isNone()) {
    const prevMatchEndIndex = 0;
    const before = Element.fromText(Text.get(textNode).substring(prevMatchEndIndex, matches.match.startIndex));
    Insert.before(textNode, before);
  }

  // Insert the replacement node
  Insert.before(textNode, replacementNode);

  // Add `after` text node (after the match)
  const nextMatchStartIndex = nextMatch.isSome() ? nextMatch.getOrDie().startIndex : textNode.dom().length;
  const after = Element.fromText(Text.get(textNode).substring(match.endIndex, nextMatchStartIndex));
  Insert.before(textNode, after);
};

const findAndReplaceDOMText = (editor: Editor, regex: RegExp, matchSelection: boolean) => {
  const matchCount = Cell(0);
  const matchedTextNodes: Element<DOMText>[] = [];
  const editorBody = editor.getBody();
  const walker = new TreeWalker(editorBody, editorBody);

  do {
    if (walker.current().nodeType !== Node.TEXT_NODE) {
      continue;
    }

    // TODO: Need to consider fragmented text nodes since the text to find could be over multiple text nodes
    // Possible solution: Walk right across the text nodes and bundle them together so that it is possible for the user specified search text to be in the bundle (will need some algorithm to do this efficiently)
    const textNode = Element.fromDom(walker.current()) as Element<DOMText>;

    // TODO: nodeInSelection is not working - have to come up with a more robust solution
    // Potentially, this check should be in another function
    if (matchSelection && !nodeInSelection(editor, textNode)) {
      continue;
    }

    const matches = getMatches(textNode, regex, matchCount);
    Arr.each(matches, (match, idx) => {
      const prevMatch = Option.from(matches[idx - 1]);
      const nextMatch = Option.from(matches[idx + 1]);
      insertReplacementNode({ prevMatch, match, nextMatch }, textNode);
    });

    if (matches.length > 0) {
      matchedTextNodes.push(textNode);
    }
  } while (walker.next());

  // Remove old text nodes
  Arr.each(matchedTextNodes, (textNode) => {
    Remove.remove(textNode);
  });

  return matchCount.get();
};

export {
  findAndReplaceDOMText
};
