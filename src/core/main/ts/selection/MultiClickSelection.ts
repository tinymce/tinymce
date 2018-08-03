/**
 * TripleClickSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';
import { CaretPosition } from 'tinymce/core/caret/CaretPosition';
import { isTextBlock } from 'tinymce/core/dom/ElementType';
import { Element as SugarElement } from '@ephox/sugar';
import NodeType from 'tinymce/core/dom/NodeType';
import CaretFinder from 'tinymce/core/caret/CaretFinder';
import RangeNormalizer from 'tinymce/core/selection/RangeNormalizer';
import { Node, Element } from '@ephox/dom-globals';

const isTextBlockNode = (node: Node): node is Element => NodeType.isElement(node) && isTextBlock(SugarElement.fromDom(node));

const normalizeSelection = (editor: Editor) => {
  const rng = editor.selection.getRng();
  const startPos = CaretPosition.fromRangeStart(rng);
  const endPos = CaretPosition.fromRangeEnd(rng);

  if (CaretPosition.isElementPosition(startPos)) {
    const container = startPos.container();
    if (isTextBlockNode(container)) {
      CaretFinder.firstPositionIn(container).each((pos) => rng.setStart(pos.container(), pos.offset()));
    }
  }

  if (CaretPosition.isElementPosition(endPos)) {
    const container = startPos.container();
    if (isTextBlockNode(container)) {
      CaretFinder.lastPositionIn(container).each((pos) => rng.setEnd(pos.container(), pos.offset()));
    }
  }

  editor.selection.setRng(RangeNormalizer.normalize(rng));
};

const setup = (editor: Editor) => {
  editor.on('click', (e) => {
    if (e.detail >= 3) {
      normalizeSelection(editor);
    }
  });
};

export {
  setup
};
