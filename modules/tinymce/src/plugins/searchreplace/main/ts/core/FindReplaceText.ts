/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Node, Range } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { DomSearch, NamedPattern, SearchResult } from '@ephox/phoenix';
import { PRegExp } from '@ephox/polaris';
import { Attr, Element, Elements, Insert } from '@ephox/sugar';
import Selection from 'tinymce/core/api/dom/Selection';

const isNodeWithin = (rng: Range, node: Node) => {
  const document = node.ownerDocument;
  const innerRange = document.createRange();
  innerRange.selectNode(node);
  return innerRange.compareBoundaryPoints(rng.END_TO_START, rng) < 1 && innerRange.compareBoundaryPoints(rng.START_TO_END, rng) > -1;
};

const findNodesInRange = (rng: Range) => {
  const commonAncestor = rng.commonAncestorContainer;
  return Arr.filter(commonAncestor.childNodes, Fun.curry(isNodeWithin, rng));
};

const find = (pattern: PRegExp, nodes: Node[]) => DomSearch.run(Elements.fromDom(nodes), [ NamedPattern('', pattern) ]);

const mark = (matches: SearchResult<Element>[], replacementNode: HTMLElement) => {
  Arr.each(matches, (match, idx) => {
    Arr.each(match.elements(), (elm) => {
      const wrapper = Element.fromDom(replacementNode.cloneNode(false) as HTMLElement);
      Attr.set(wrapper, 'data-mce-index', idx);
      Insert.wrap(elm, wrapper);
    });
  });
};

const findAndMark = (pattern: PRegExp, node: Node, replacementNode: HTMLElement) => {
  const matches = find(pattern, [ node ]);
  mark(matches, replacementNode);
  return matches.length;
};

const findAndMarkInSelection = (pattern: PRegExp, selection: Selection, replacementNode: HTMLElement) => {
  const bookmark = selection.getBookmark();

  // Find matching text nodes
  const nodes = findNodesInRange(selection.getRng());
  const nodeMatches = find(pattern, nodes);

  // Restore the selection so we can compare if the matches are within the original range
  // but ensure the bookmark markers aren't removed
  selection.moveToBookmark({ ...bookmark, keep: true });

  // Filter out any text matches outside the range, as the node may only be partly selected
  const rng = selection.getRng();
  const matches = Arr.foldl(nodeMatches, (acc, match) => {
    const elements = Arr.filter(match.elements(), (e) => isNodeWithin(rng, e.dom()));
    return elements.length > 0 ? acc.concat({ ...match, elements: Fun.constant(elements) }) : acc;
  }, [] as SearchResult<Element>[]);

  // Mark matches
  mark(matches, replacementNode);

  // Restore the selection one last time
  selection.moveToBookmark(bookmark);
  return matches.length;
};

export {
  findAndMark,
  findAndMarkInSelection
};
