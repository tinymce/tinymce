/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Element, Traverse, Css, PredicateFind } from '@ephox/sugar';
import Editor from '../api/Editor';
import { isListItem, isList, isTable } from '../dom/ElementType';
import * as Settings from '../api/Settings';
import * as NodeType from '../dom/NodeType';

const isEditable = (target: Element) => PredicateFind.closest(target, (elm) => NodeType.isContentEditableTrue(elm.dom()) || NodeType.isContentEditableFalse(elm.dom())).exists((elm) => NodeType.isContentEditableTrue(elm.dom()));

const parseIndentValue = (value: string) => {
  const number = parseInt(value, 10);
  return isNaN(number) ? 0 : number;
};

const getIndentStyleName = (useMargin: boolean, element: Element) => {
  const indentStyleName = useMargin || isTable(element) ? 'margin' : 'padding';
  const suffix = Css.get(element, 'direction') === 'rtl' ? '-right' : '-left';
  return indentStyleName + suffix;
};

const indentElement = (dom, command: string, useMargin: boolean, value: number, unit: string, element: HTMLElement) => {
  const indentStyleName = getIndentStyleName(useMargin, Element.fromDom(element));

  if (command === 'outdent') {
    const styleValue = Math.max(0, parseIndentValue(element.style[indentStyleName]) - value);
    dom.setStyle(element, indentStyleName, styleValue ? styleValue + unit : '');
  } else {
    const styleValue = parseIndentValue(element.style[indentStyleName]) + value + unit;
    dom.setStyle(element, indentStyleName, styleValue);
  }
};

const validateBlocks = (editor: Editor, blocks: Element[]) => Arr.forall(blocks, (block) => {
  const indentStyleName = getIndentStyleName(Settings.shouldIndentUseMargin(editor), block);
  const intentValue = Css.getRaw(block, indentStyleName).map(parseIndentValue).getOr(0);
  const contentEditable = editor.dom.getContentEditable(block.dom());
  return contentEditable !== 'false' && intentValue > 0;
});

const canOutdent = (editor: Editor) => {
  const blocks = getBlocksToIndent(editor);
  return !editor.mode.isReadOnly() && (blocks.length > 1 || validateBlocks(editor, blocks));
};

const isListComponent = (el: Element) => isList(el) || isListItem(el);

const parentIsListComponent = (el: Element) => Traverse.parent(el).map(isListComponent).getOr(false);

const getBlocksToIndent = (editor: Editor) => Arr.filter(Arr.map(editor.selection.getSelectedBlocks(), Element.fromDom), (el) =>
  !isListComponent(el) && !parentIsListComponent(el) && isEditable(el)
) as Element<HTMLElement>[];

const handle = (editor: Editor, command: string) => {
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
    indentElement(dom, command, useMargin, indentValue, indentUnit, block.dom());
  });
};

export {
  canOutdent,
  handle
};
