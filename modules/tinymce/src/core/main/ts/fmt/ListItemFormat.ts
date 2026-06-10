import { Arr, Obj, Optional, Type } from '@ephox/katamari';

import type DOMUtils from '../api/dom/DOMUtils';
import type EditorSelection from '../api/dom/Selection';
import type Formatter from '../api/Formatter';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';

import type { Format, InlineFormat } from './FormatTypes';
import * as FormatUtils from './FormatUtils';

export const listItemStyles = [ 'fontWeight', 'fontStyle', 'color', 'fontSize', 'fontFamily' ];

const hasListStyles = (fmt: InlineFormat) => Type.isObject(fmt.styles) && Arr.exists(Obj.keys(fmt.styles), (name) => Arr.contains(listItemStyles, name));

const findExpandedListItemFormat = (formats: Format[]) =>
  Arr.find(formats, (fmt) => FormatUtils.isInlineFormat(fmt) && fmt.inline === 'span' && hasListStyles(fmt));

export const getExpandedListItemFormat = (formatter: Formatter, format: string): Optional<Format> => {
  const formatList = formatter.get(format);

  return Type.isArray(formatList) ? findExpandedListItemFormat(formatList) : Optional.none();
};

const isRngStartAtStartOfElement = (rng: Range, elm: Element) => CaretFinder.prevPosition(elm, CaretPosition.fromRangeStart(rng)).isNone();

const isRngEndAtEndOfElement = (rng: Range, elm: Element) => {
  return CaretFinder.nextPosition(elm, CaretPosition.fromRangeEnd(rng))
    .exists((pos) => !NodeType.isBr(pos.getNode()) || CaretFinder.nextPosition(elm, pos).isSome()) === false;
};

const isEditableListItem = (dom: DOMUtils) => (elm: Element) => NodeType.isListItem(elm) && dom.isEditable(elm);

// TINY-13197: If the content is wrapped inside a block element, the first block returned by getSelectedBlocks() is not LI, even when the content is fully selected.
// However, the second and subsequent do return LI as the selected block so only the first block needs to be adjusted
const getAndOnlyNormalizeFirstBlockIf = (selection: EditorSelection, pred: (block: Element) => boolean) =>
  Arr.map(selection.getSelectedBlocks(), (block, i) => {
    if (i === 0 && pred(block)) {
      return selection.dom.getParent(block, NodeType.isListItem) ?? block;
    } else {
      return block;
    }
  });

const getFullySelectedBlocks = (selection: EditorSelection) => {
  if (selection.isCollapsed()) {
    return [];
  }

  const rng = selection.getRng();
  const blocks = getAndOnlyNormalizeFirstBlockIf(
    selection,
    (el) => isRngStartAtStartOfElement(rng, el) && !NodeType.isListItem(el)
  );

  if (blocks.length === 1) {
    return isRngStartAtStartOfElement(rng, blocks[0]) && isRngEndAtEndOfElement(rng, blocks[0]) ? blocks : [];
  } else {
    const first = Arr.head(blocks).filter((elm) => isRngStartAtStartOfElement(rng, elm)).toArray();
    const last = Arr.last(blocks).filter((elm) => isRngEndAtEndOfElement(rng, elm)).toArray();
    const middle = blocks.slice(1, -1);
    return first.concat(middle).concat(last);
  }
};

export const getFullySelectedListItems = (selection: EditorSelection): Element[] =>
  Arr.filter(getFullySelectedBlocks(selection), isEditableListItem(selection.dom));

export const getPartiallySelectedListItems = (selection: EditorSelection): Element[] => Arr.filter(
  getAndOnlyNormalizeFirstBlockIf(selection, (el) => !NodeType.isListItem(el)),
  isEditableListItem(selection.dom)
);
