/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Fun } from '@ephox/katamari';
import NodeType from '../dom/NodeType';
import { Text } from '@ephox/dom-globals';
import CaretPosition from './CaretPosition';
import { isWhiteSpace } from '../text/CharType';
import { getChildNodeAtRelativeOffset } from './CaretUtils';

const isChar = (forward: boolean, predicate: (chr: string) => boolean, pos: CaretPosition) => {
  return Option.from(pos.container()).filter(NodeType.isText).exists((text: Text) => {
    const delta = forward ? 0 : -1;
    return predicate(text.data.charAt(pos.offset() + delta));
  });
};

const isBeforeSpace = Fun.curry(isChar, true, isWhiteSpace);
const isAfterSpace = Fun.curry(isChar, false, isWhiteSpace);

const isEmptyText = (pos: CaretPosition) => {
  const container = pos.container();
  return NodeType.isText(container) && container.data.length === 0;
};

const isNextToContentEditableFalse = (relativeOffset: number, caretPosition: CaretPosition) => {
  const node = getChildNodeAtRelativeOffset(relativeOffset, caretPosition);
  return NodeType.isContentEditableFalse(node) && !NodeType.isBogusAll(node);
};

const isBeforeContentEditableFalse = Fun.curry(isNextToContentEditableFalse, 0);
const isAfterContentEditableFalse = Fun.curry(isNextToContentEditableFalse, -1);

const isNextToTable = (relativeOffset: number, caretPosition: CaretPosition) => {
  return NodeType.isTable(getChildNodeAtRelativeOffset(relativeOffset, caretPosition));
};

const isBeforeTable = Fun.curry(isNextToTable, 0);
const isAfterTable = Fun.curry(isNextToTable, -1);

export {
  isBeforeSpace,
  isAfterSpace,
  isEmptyText,
  isBeforeContentEditableFalse,
  isAfterContentEditableFalse,
  isBeforeTable,
  isAfterTable
};
