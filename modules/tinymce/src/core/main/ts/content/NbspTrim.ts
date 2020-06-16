/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range } from '@ephox/dom-globals';
import { Unicode } from '@ephox/katamari';
import * as NodeType from '../dom/NodeType';

const isAfterNbsp = (container: Node, offset: number) => NodeType.isText(container) && container.nodeValue[offset - 1] === Unicode.nbsp;

const trimOrPadLeftRight = (rng: Range, html: string): string => {
  const container = rng.startContainer;
  const offset = rng.startOffset;

  const hasSiblingText = function (siblingName) {
    return container[siblingName] && container[siblingName].nodeType === 3;
  };

  if (NodeType.isText(container)) {
    if (offset > 0) {
      html = html.replace(/^&nbsp;/, ' ');
    } else if (!hasSiblingText('previousSibling')) {
      html = html.replace(/^ /, '&nbsp;');
    }

    if (offset < container.length) {
      html = html.replace(/&nbsp;(<br>|)$/, ' ');
    } else if (!hasSiblingText('nextSibling')) {
      html = html.replace(/(&nbsp;| )(<br>|)$/, '&nbsp;');
    }
  }

  return html;
};

// Removes &nbsp; from a [b] c -> a &nbsp;c -> a c
const trimNbspAfterDeleteAndPadValue = (rng: Range, value: string): string => {
  const container = rng.startContainer;
  const offset = rng.startOffset;

  if (NodeType.isText(container) && rng.collapsed) {
    if (container.data[offset] === Unicode.nbsp) {
      container.deleteData(offset, 1);

      if (!/[\u00a0| ]$/.test(value)) {
        value += ' ';
      }
    } else if (container.data[offset - 1] === Unicode.nbsp) {
      container.deleteData(offset - 1, 1);

      if (!/[\u00a0| ]$/.test(value)) {
        value = ' ' + value;
      }
    }
  }

  return value;
};

export {
  isAfterNbsp,
  trimNbspAfterDeleteAndPadValue,
  trimOrPadLeftRight
};
