/**
 * Range.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import NodeType from './NodeType';

const getNormalizedEndPoint = function (container, offset) {
  const node = RangeUtils.getNode(container, offset);

  if (NodeType.isListItemNode(container) && NodeType.isTextNode(node)) {
    const textNodeOffset = offset >= container.childNodes.length ? node.data.length : 0;
    return { container: node, offset: textNodeOffset };
  }

  return { container, offset };
};

const normalizeRange = function (rng) {
  const outRng = rng.cloneRange();

  const rangeStart = getNormalizedEndPoint(rng.startContainer, rng.startOffset);
  outRng.setStart(rangeStart.container, rangeStart.offset);

  const rangeEnd = getNormalizedEndPoint(rng.endContainer, rng.endOffset);
  outRng.setEnd(rangeEnd.container, rangeEnd.offset);

  return outRng;
};

export default {
  getNormalizedEndPoint,
  normalizeRange
};