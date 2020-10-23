/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';
import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as Parents from '../dom/Parents';
import * as CaretFormat from '../fmt/CaretFormat';
import * as DeleteElement from './DeleteElement';
import * as DeleteUtils from './DeleteUtils';

const getParentInlines = (rootElm: SugarElement, startElm: SugarElement): SugarElement[] => {
  const parents = Parents.parentsAndSelf(startElm, rootElm);
  return Arr.findIndex(parents, ElementType.isBlock).fold(
    Fun.constant(parents),
    (index) => parents.slice(0, index)
  );
};

const hasOnlyOneChild = (elm: SugarElement) => Traverse.children(elm).length === 1;

const deleteLastPosition = (forward: boolean, editor: Editor, target: SugarElement, parentInlines: SugarElement[]) => {
  const isFormatElement = Fun.curry(CaretFormat.isFormatElement, editor);
  const formatNodes = Arr.map(Arr.filter(parentInlines, isFormatElement), (elm) => elm.dom);

  if (formatNodes.length === 0) {
    DeleteElement.deleteElement(editor, forward, target);
  } else {
    const pos = CaretFormat.replaceWithCaretFormat(target.dom, formatNodes);
    editor.selection.setRng(pos.toRange());
  }
};

const deleteCaret = (editor: Editor, forward: boolean) => {
  const rootElm = SugarElement.fromDom(editor.getBody());
  const startElm = SugarElement.fromDom(editor.selection.getStart());
  const parentInlines = Arr.filter(getParentInlines(rootElm, startElm), hasOnlyOneChild);

  return Arr.last(parentInlines).exists((target) => {
    const fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());
    if (DeleteUtils.willDeleteLastPositionInElement(forward, fromPos, target.dom) && !CaretFormat.isEmptyCaretFormatElement(target)) {
      deleteLastPosition(forward, editor, target, parentInlines);
      return true;
    } else {
      return false;
    }
  });
};

const backspaceDelete = (editor: Editor, forward: boolean) => editor.selection.isCollapsed() ? deleteCaret(editor, forward) : false;

export {
  backspaceDelete
};
