import { Arr, Obj, Optional, Type } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import EditorSelection from '../api/dom/Selection';
import Formatter from '../api/Formatter';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import { Format, InlineFormat } from './FormatTypes';
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

const getFullySelectedBlocks = (selection: EditorSelection) => {
  const blocks = selection.getSelectedBlocks();
  const rng = selection.getRng();

  if (selection.isCollapsed()) {
    return [];
  } if (blocks.length === 1) {
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

export const getPartiallySelectedListItems = (selection: EditorSelection): Element[] =>
  Arr.filter(selection.getSelectedBlocks(), isEditableListItem(selection.dom));
