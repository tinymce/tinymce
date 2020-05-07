/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Node } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Attr, Element, Insert, Text } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Selection from 'tinymce/core/api/dom/Selection';
import * as TextCollect from './TextCollect';
import * as TextPosition from './TextPosition';
import { Pattern, TextMatch, TextSection } from './Types';

const find = (pattern: Pattern, sections: TextSection[]) => Arr.bind(sections, (section) => {
  const elements = section.elements;
  const content = Arr.map(elements, Text.get).join('');
  const positions = TextPosition.find(content, pattern, section.sOffset, content.length - section.fOffset);
  return TextPosition.extract(elements, positions);
});

const mark = (matches: TextMatch[][], replacementNode: HTMLElement) => {
  // Walk backwards and mark the positions
  // Note: We need to walk backwards so the position indexes don't change
  Arr.eachr(matches, (match, idx) => {
    Arr.eachr(match, (pos) => {
      const wrapper = Element.fromDom(replacementNode.cloneNode(false) as HTMLElement);
      Attr.set(wrapper, 'data-mce-index', idx);
      const textNode = pos.element.dom();
      if (textNode.length === pos.finish && pos.start === 0) {
        Insert.wrap(pos.element, wrapper);
      } else {
        if (textNode.length !== pos.finish) {
          textNode.splitText(pos.finish);
        }
        const matchNode = textNode.splitText(pos.start);
        Insert.wrap(Element.fromDom(matchNode), wrapper);
      }
    });
  });
};

const findAndMark = (dom: DOMUtils, pattern: Pattern, node: Node, replacementNode: HTMLElement) => {
  const textSections = TextCollect.fromNode(dom, node);
  const matches = find(pattern, textSections);
  mark(matches, replacementNode);
  return matches.length;
};

const findAndMarkInSelection = (dom: DOMUtils, pattern: Pattern, selection: Selection, replacementNode: HTMLElement) => {
  const bookmark = selection.getBookmark();

  // Handle table cell selection as the table plugin enables
  // you to fake select table cells and perform actions on them
  const nodes = dom.select('td[data-mce-selected],th[data-mce-selected]');
  const textSections = nodes.length > 0 ? TextCollect.fromNodes(dom, nodes) : TextCollect.fromRng(dom, selection.getRng());

  // Find and mark matches
  const matches = find(pattern, textSections);
  mark(matches, replacementNode);

  // Restore the selection
  selection.moveToBookmark(bookmark);
  return matches.length;
};

export {
  findAndMark,
  findAndMarkInSelection
};
