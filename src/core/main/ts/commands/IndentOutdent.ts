/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';
import { Arr } from '@ephox/katamari';
import { HTMLElement } from '@ephox/dom-globals';
import { isListItem, isList } from '../dom/ElementType';
import { Element, Traverse } from '@ephox/sugar';

const indentElement = (dom, command: string, useMargin: boolean, value: number, unit: string, element: HTMLElement) => {
  if (dom.getContentEditable(element) === 'false') {
    return;
  }

  let indentStyleName = useMargin ? 'margin' : 'padding';
  indentStyleName = element.nodeName === 'TABLE' ? 'margin' : indentStyleName;
  indentStyleName += dom.getStyle(element, 'direction', true) === 'rtl' ? 'Right' : 'Left';

  if (command === 'outdent') {
    const styleValue = Math.max(0, parseInt(element.style[indentStyleName] || 0, 10) - value);
    dom.setStyle(element, indentStyleName, styleValue ? styleValue + unit : '');
  } else {
    const styleValue = (parseInt(element.style[indentStyleName] || 0, 10) + value) + unit;
    dom.setStyle(element, indentStyleName, styleValue);
  }
};

const isListComponent = (el: Element) => {
  return isList(el) || isListItem(el);
};

const parentIsListComponent = (el: Element) => {
  return Traverse.parent(el).map(isListComponent).getOr(false);
};

const getBlocksToIndent = (editor: Editor) => {
  return Arr.filter(Arr.map(editor.selection.getSelectedBlocks(), Element.fromDom), (el) =>
    !isListComponent(el) && !parentIsListComponent(el)
  );
};

export const handle = (editor: Editor, command: string) => {
  const { settings, dom, selection, formatter } = editor;
  const indentUnit = /[a-z%]+$/i.exec(settings.indentation)[0];
  const indentValue = parseInt(settings.indentation, 10);
  const useMargin = editor.getParam('indent_use_margin', false);

  // If forced_root_blocks is set to false we don't have a block to indent so lets create a div
  if (!editor.queryCommandState('InsertUnorderedList') && !editor.queryCommandState('InsertOrderedList')) {
    if (!settings.forced_root_block && !dom.getParent(selection.getNode(), dom.isBlock)) {
      formatter.apply('div');
    }
  }

  Arr.each(getBlocksToIndent(editor), (block) => {
    indentElement(dom, command, useMargin, indentValue, indentUnit, block.dom());
  });
};