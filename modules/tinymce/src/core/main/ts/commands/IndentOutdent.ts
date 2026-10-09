import { Arr, Strings } from '@ephox/katamari';
import { Css, PredicateFind, SugarElement, SugarElements, Traverse } from '@ephox/sugar';

import type DOMUtils from '../api/dom/DOMUtils';
import type Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as Bookmarks from '../bookmark/Bookmarks';
import { isList, isListItem, isTable } from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';
import * as FormatUtils from '../fmt/FormatUtils';
import { indentListSelection, outdentListSelection } from '../lists/actions/Indentation';
import * as ListIndentation from '../lists/listmodel/ListsIndendation';
import * as TableCellSelection from '../selection/TableCellSelection';

type IndentStyle = 'margin-left' | 'margin-right' | 'padding-left' | 'padding-right';

const isEditable = (target: SugarElement<Node>): boolean =>
  PredicateFind.closest(target, (elm) => NodeType.isContentEditableTrue(elm.dom) || NodeType.isContentEditableFalse(elm.dom))
    .exists((elm) => NodeType.isContentEditableTrue(elm.dom));

const parseIndentValue = (value: string | undefined): number =>
  Strings.toInt(value ?? '').getOr(0);

const getIndentStyleName = (useMargin: boolean, element: SugarElement<HTMLElement>): IndentStyle => {
  const indentStyleName = useMargin || isTable(element) ? 'margin' : 'padding';
  const suffix = Css.get(element, 'direction') === 'rtl' ? '-right' : '-left';
  return indentStyleName + suffix as IndentStyle;
};

const indentElement = (dom: DOMUtils, command: string, useMargin: boolean, value: number, unit: string, element: HTMLElement): void => {
  const indentStyleName = getIndentStyleName(useMargin, SugarElement.fromDom(element));
  const parsedValue = parseIndentValue(dom.getStyle(element, indentStyleName));

  if (command === 'outdent') {
    const styleValue = Math.max(0, parsedValue - value);
    dom.setStyle(element, indentStyleName, styleValue ? styleValue + unit : '');
  } else {
    const styleValue = (parsedValue + value) + unit;
    dom.setStyle(element, indentStyleName, styleValue);
  }
};

const validateBlocks = (editor: Editor, blocks: SugarElement<HTMLElement>[]): boolean =>
  Arr.forall(blocks, (block) => {
    const indentStyleName = getIndentStyleName(Options.shouldIndentUseMargin(editor), block);
    const intentValue = Css.getRaw(block, indentStyleName).map(parseIndentValue).getOr(0);
    const contentEditable = editor.dom.getContentEditable(block.dom);
    return contentEditable !== 'false' && intentValue > 0;
  });

const getCellContentBlocks = (editor: Editor, cell: SugarElement<HTMLElement>): SugarElement<HTMLElement>[] =>
  Arr.filter(SugarElements.fromDom(Arr.from(cell.dom.childNodes)), (child): child is SugarElement<HTMLElement> =>
    editor.dom.isBlock(child.dom));

const canOutdent = (editor: Editor): boolean => {
  const blocks = getBlocksToIndent(editor);
  const indentedBlocks = Arr.bind(blocks, (block) => {
    if (!NodeType.isTableCell(block.dom)) {
      return [ block ];
    }

    const inner = getCellContentBlocks(editor, block);
    return inner.length > 0 ? inner : [ block ];
  });
  return !editor.mode.isReadOnly() && (blocks.length > 1 || validateBlocks(editor, indentedBlocks));
};

const canIndent = (editor: Editor): boolean =>
  !editor.mode.isReadOnly() && ListIndentation.canIndent(editor);

const isListComponent = (el: SugarElement<Node>): boolean =>
  isList(el) || isListItem(el);

const parentIsListComponent = (el: SugarElement<Node>): boolean =>
  Traverse.parent(el).exists(isListComponent);

const wrapCellInlineContent = (editor: Editor, cell: HTMLElement): HTMLElement[] => {
  const { dom } = editor;
  const children = Arr.filter(Arr.from(cell.childNodes), (child) => !FormatUtils.isEmptyTextNode(child));
  const blocks: HTMLElement[] = [];
  let run: Node[] = [];

  const flushRun = () => {
    if (run.length > 0 && !Arr.forall(run, Bookmarks.isBookmarkNode)) {
      const wrapper = dom.create('p');
      cell.insertBefore(wrapper, run[0]);
      Arr.each(run, (n) => wrapper.appendChild(n));
      blocks.push(wrapper);
    }
    run = [];
  };

  Arr.each(children, (c) => {
    if (dom.isBlock(c)) {
      flushRun();
      blocks.push(c);
    } else {
      run.push(c);
    }
  });
  flushRun();

  return blocks;
};

const getBlocksToIndent = (editor: Editor): SugarElement<HTMLElement>[] => {
  const selectedCells = TableCellSelection.getCellsFromEditor(editor);
  return selectedCells.length === 0 ?
    Arr.filter(SugarElements.fromDom(editor.selection.getSelectedBlocks()), (el): el is SugarElement<HTMLElement> =>
      !isListComponent(el) && !parentIsListComponent(el) && isEditable(el)
    ) : selectedCells;
};

const handle = (editor: Editor, command: string): void => {
  if (editor.mode.isReadOnly()) {
    return;
  }

  const { dom } = editor;
  const indentation = Options.getIndentation(editor);
  const indentUnit = /[a-z%]+$/i.exec(indentation)?.[0] ?? 'px';
  const indentValue = parseIndentValue(indentation);
  const useMargin = Options.shouldIndentUseMargin(editor);

  Arr.each(getBlocksToIndent(editor), (block) => {
    if (NodeType.isTableCell(block.dom)) {
      const bm = editor.selection.getBookmark();
      Arr.each(wrapCellInlineContent(editor, block.dom), (w) => {
        indentElement(dom, command, useMargin, indentValue, indentUnit, w);
      });
      editor.selection.moveToBookmark(bm);
    } else {
      indentElement(dom, command, useMargin, indentValue, indentUnit, block.dom);
    }
  });

  if (command === 'indent') {
    indentListSelection(editor);
  } else {
    outdentListSelection(editor);
  }
};

const indent = (editor: Editor): void => handle(editor, 'indent');
const outdent = (editor: Editor): void => handle(editor, 'outdent');

export {
  canIndent,
  canOutdent,
  indent,
  outdent
};
