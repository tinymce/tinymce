/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Fun } from '@ephox/katamari';
import NodeType from '../dom/NodeType';
import { Text, Node } from '@ephox/dom-globals';
import CaretPosition from './CaretPosition';
import { isWhiteSpace } from '../text/CharType';
import { getChildNodeAtRelativeOffset } from './CaretUtils';
import { Class, Element } from '@ephox/sugar';

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

const matchesElementPosition = (before: boolean, predicate: (node: Node) => boolean) => {
  return (pos: CaretPosition) => Option.from(getChildNodeAtRelativeOffset(before ? 0 : -1, pos)).filter(predicate).isSome();
};

const isPageBreak = (node: Node) => {
  return NodeType.isElement(node) && Class.has(Element.fromDom(node), 'mce-pagebreak');
};

const isCefNode = (node: Node) => NodeType.isContentEditableFalse(node) && !NodeType.isBogusAll(node);

const isBeforePageBreak = matchesElementPosition(true, isPageBreak);
const isAfterPageBreak = matchesElementPosition(false, isPageBreak);
const isBeforeTable = matchesElementPosition(true, NodeType.isTable);
const isAfterTable = matchesElementPosition(false, NodeType.isTable);
const isBeforeContentEditableFalse = matchesElementPosition(true, isCefNode);
const isAfterContentEditableFalse = matchesElementPosition(false, isCefNode);

export {
  isBeforeSpace,
  isAfterSpace,
  isEmptyText,
  isBeforeContentEditableFalse,
  isAfterContentEditableFalse,
  isBeforeTable,
  isAfterTable,
  isBeforePageBreak,
  isAfterPageBreak
};
