import { Fun, Optional } from '@ephox/katamari';
import { Css, SugarElement } from '@ephox/sugar';

import BookmarkManager from '../api/dom/BookmarkManager';
import * as NodeType from '../dom/NodeType';
import { isWhiteSpace } from '../text/CharType';
import * as Zwsp from '../text/Zwsp';
import CaretPosition from './CaretPosition';
import { getChildNodeAtRelativeOffset } from './CaretUtils';

const isChar = (forward: boolean, predicate: (chr: string) => boolean, pos: CaretPosition): boolean =>
  Optional.from(pos.container()).filter(NodeType.isText).exists((text) => {
    const delta = forward ? 0 : -1;
    return predicate(text.data.charAt(pos.offset() + delta));
  });

const isBeforeSpace = Fun.curry(isChar, true, isWhiteSpace);
const isAfterSpace = Fun.curry(isChar, false, isWhiteSpace);

const isEmptyText = (pos: CaretPosition): boolean => {
  const container = pos.container();
  return NodeType.isText(container) && (container.data.length === 0 || Zwsp.isZwsp(container.data) && BookmarkManager.isBookmarkNode(container.parentNode));
};

const matchesElementPosition = (before: boolean, predicate: (node: Node) => boolean) => (pos: CaretPosition): boolean =>
  getChildNodeAtRelativeOffset(before ? 0 : -1, pos).filter(predicate).isSome();

const isImageBlock = (node: Node): boolean =>
  NodeType.isImg(node) && Css.get(SugarElement.fromDom(node), 'display') === 'block';

const isCefNode = (node: Node): boolean =>
  NodeType.isContentEditableFalse(node) && !NodeType.isBogusAll(node);

const isBeforeImageBlock = matchesElementPosition(true, isImageBlock);
const isAfterImageBlock = matchesElementPosition(false, isImageBlock);
const isBeforeMedia = matchesElementPosition(true, NodeType.isMedia);
const isAfterMedia = matchesElementPosition(false, NodeType.isMedia);
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
  isBeforeImageBlock,
  isAfterImageBlock,
  isBeforeMedia,
  isAfterMedia
};
