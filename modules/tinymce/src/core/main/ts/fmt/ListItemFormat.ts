import { Arr, Obj, Optional, Strings, Type } from '@ephox/katamari';
import { SelectorFilter } from '@ephox/sugar';

import type DOMUtils from '../api/dom/DOMUtils';
import type EditorSelection from '../api/dom/Selection';
import type Editor from '../api/Editor';
import type Formatter from '../api/Formatter';
import * as NodeType from '../dom/NodeType';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as TableCellSelection from '../selection/TableCellSelection';

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

// Resolve list items from the
// selected cells directly instead, matching how SelectionUtils.runOnRanges resolves fake selections.
const getCellSelectionListItems = (editor: Editor): Optional<Element[]> => {
  const fakeSelectionNodes = TableCellSelection.getCellsFromEditor(editor);
  if (fakeSelectionNodes.length > 0) {
    const listItems = Arr.bind(fakeSelectionNodes, (cell) => SelectorFilter.descendants(cell, 'li'));
    return Optional.some(Arr.map(listItems, (item) => item.dom));
  } else {
    return Optional.none();
  }
};

const getFullySelectedBlocks = (selection: EditorSelection) => {
  if (selection.isCollapsed()) {
    return [];
  }

  const rng = selection.getRng();
  const blocks = getAndOnlyNormalizeFirstBlockIf(
    selection,
    (el) => SelectionUtils.isRngStartAtStartOfElement(rng, el) && !NodeType.isListItem(el)
  );

  return SelectionUtils.getFullySelectedBlocksFromRange(rng, blocks);
};

export const getFullySelectedListItems = (editor: Editor): Element[] => {
  const items = getCellSelectionListItems(editor).getOrThunk(() => getFullySelectedBlocks(editor.selection));
  return Arr.filter(items, isEditableListItem(editor.selection.dom));
};

export const getPartiallySelectedListItems = (editor: Editor): Element[] => {
  const items = getCellSelectionListItems(editor)
    .getOrThunk(() => getAndOnlyNormalizeFirstBlockIf(editor.selection, (el) => !NodeType.isListItem(el)));
  return Arr.filter(items, isEditableListItem(editor.selection.dom));
};

const inheritedListItemStyleResets: Record<string, string> = {
  fontWeight: 'normal',
  fontStyle: 'normal'
};

const findClosestAncestorListItemStyle = (dom: DOMUtils, root: Node, li: Element, name: string): Optional<string> => {
  const listItemAncestors = dom.getParents(li.parentNode, NodeType.isListItem, root);

  return Arr.findMap(listItemAncestors, (parent) => Optional.from(dom.getStyle(parent, name)).filter(Strings.isNotEmpty));
};

export const resetInheritedListItemStyles = (dom: DOMUtils, root: Node, li: Element, names: string[]): void => {
  Arr.each(names, (name) => {
    Obj.get(inheritedListItemStyleResets, name).each((resetValue) => {
      const isInherited = findClosestAncestorListItemStyle(dom, root, li, name).exists((value) => value !== resetValue);
      if (isInherited) {
        dom.setStyle(li, name, resetValue);
      }
    });
  });
};
