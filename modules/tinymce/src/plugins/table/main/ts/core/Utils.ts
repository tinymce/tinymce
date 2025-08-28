/*
 NOTE: This file is partially duplicated in the following locations:
  - models/dom/table/core/TableUtils.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
 */

import { Compare, ContentEditable, PredicateFind, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const getNodeName = (elm: Node): string =>
  elm.nodeName.toLowerCase();

const getBody = (editor: Editor): SugarElement<HTMLElement> =>
  SugarElement.fromDom(editor.getBody());

const getIsRoot = (editor: Editor) => (element: SugarElement<Node>): boolean =>
  Compare.eq(element, getBody(editor));

const removePxSuffix = (size: string): string =>
  size ? size.replace(/px$/, '') : '';

const addPxSuffix = (size: string): string =>
  /^\d+(\.\d+)?$/.test(size) ? size + 'px' : size;

const getSelectionStart = (editor: Editor): SugarElement<Element> =>
  SugarElement.fromDom(editor.selection.getStart());

const getSelectionEnd = (editor: Editor): SugarElement<Element> =>
  SugarElement.fromDom(editor.selection.getEnd());

const isInEditableContext = (cell: SugarElement<Node>): boolean =>
  PredicateFind.closest(cell, SugarNode.isTag('table')).forall(ContentEditable.isEditable);

export {
  getNodeName,
  getBody,
  getIsRoot,
  addPxSuffix,
  removePxSuffix,
  getSelectionStart,
  getSelectionEnd,
  isInEditableContext
};
