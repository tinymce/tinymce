/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Element } from '@ephox/dom-globals';
import { Element as SugarElement } from '@ephox/sugar';
import Editor from '../api/Editor';
import { CaretPosition } from '../caret/CaretPosition';
import { isTextBlock } from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';
import * as CaretFinder from '../caret/CaretFinder';
import * as RangeNormalizer from './RangeNormalizer';

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
