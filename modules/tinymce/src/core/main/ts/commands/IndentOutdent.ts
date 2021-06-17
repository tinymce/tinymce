/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Css, PredicateFind, SugarElement, SugarElements, Traverse } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import { isList, isListItem, isTable } from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';

const isEditable = (target: SugarElement<Node>): boolean =>
  PredicateFind.closest(target, (elm) => NodeType.isContentEditableTrue(elm.dom) || NodeType.isContentEditableFalse(elm.dom))
    .exists((elm) => NodeType.isContentEditableTrue(elm.dom));

const parseIndentValue = (value: string): number => {
  const number = parseInt(value, 10);
  return isNaN(number) ? 0 : number;
};

const getIndentStyleName = (useMargin: boolean, element: SugarElement<HTMLElement>): string => {
  const indentStyleName = useMargin || isTable(element) ? 'margin' : 'padding';
  const suffix = Css.get(element, 'direction') === 'rtl' ? '-right' : '-left';
  return indentStyleName + suffix;
};

const indentElement = (dom: DOMUtils, command: string, useMargin: boolean, value: number, unit: string, element: HTMLElement): void => {
  const indentStyleName = getIndentStyleName(useMargin, SugarElement.fromDom(element));

  if (command === 'outdent') {
    const styleValue = Math.max(0, parseIndentValue(element.style[indentStyleName]) - value);
    dom.setStyle(element, indentStyleName, styleValue ? styleValue + unit : '');
  } else {
    const styleValue = parseIndentValue(element.style[indentStyleName]) + value + unit;
    dom.setStyle(element, indentStyleName, styleValue);
  }
};

const validateBlocks = (editor: Editor, blocks: SugarElement<HTMLElement>[]): boolean =>
  Arr.forall(blocks, (block) => {
    const indentStyleName = getIndentStyleName(Settings.shouldIndentUseMargin(editor), block);
    const intentValue = Css.getRaw(block, indentStyleName).map(parseIndentValue).getOr(0);
    const contentEditable = editor.dom.getContentEditable(block.dom);
    return contentEditable !== 'false' && intentValue > 0;
  });

const canOutdent = (editor: Editor): boolean => {
  const blocks = getBlocksToIndent(editor);
  return !editor.mode.isReadOnly() && (blocks.length > 1 || validateBlocks(editor, blocks));
};

const isListComponent = (el: SugarElement<Node>): boolean =>
  isList(el) || isListItem(el);

const parentIsListComponent = (el: SugarElement<Node>): boolean =>
  Traverse.parent(el).exists(isListComponent);

const getBlocksToIndent = (editor: Editor): SugarElement<HTMLElement>[] =>
  Arr.filter(SugarElements.fromDom(editor.selection.getSelectedBlocks()), (el): el is SugarElement<HTMLElement> =>
    !isListComponent(el) && !parentIsListComponent(el) && isEditable(el)
  );

const handle = (editor: Editor, command: string): void => {
  const { dom, selection, formatter } = editor;
  const indentation = Settings.getIndentation(editor);
  const indentUnit = /[a-z%]+$/i.exec(indentation)[0];
  const indentValue = parseInt(indentation, 10);
  const useMargin = Settings.shouldIndentUseMargin(editor);
  const forcedRootBlock = Settings.getForcedRootBlock(editor);

  // If forced_root_blocks is set to false we don't have a block to indent so lets create a div
  if (!editor.queryCommandState('InsertUnorderedList') && !editor.queryCommandState('InsertOrderedList')) {
    if (forcedRootBlock === '' && !dom.getParent(selection.getNode(), dom.isBlock)) {
      formatter.apply('div');
    }
  }

  Arr.each(getBlocksToIndent(editor), (block) => {
    indentElement(dom, command, useMargin, indentValue, indentUnit, block.dom);
  });
};

export {
  canOutdent,
  handle
};
