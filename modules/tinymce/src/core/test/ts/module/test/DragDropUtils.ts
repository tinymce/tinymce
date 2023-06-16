import { DragnDrop } from '@ephox/agar';
import { TinyDom } from '@ephox/mcagar';
import { Hierarchy, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

export const dragDropHtmlInternallyToElement = (editor: Editor, html: string, target: SugarElement<Element>): void => {
  editor.fire('dragstart');
  DragnDrop.dropItems([{ data: html, type: 'text/html' }], target);
  editor.fire('dragend');
};

export const dragDropHtmlInternallyToPath = (editor: Editor, html: string, path: number[]): void => {
  const target = Hierarchy.follow(TinyDom.body(editor), path).filter(SugarNode.isElement).getOrDie('Could not resolve path to drop target element');
  dragDropHtmlInternallyToElement(editor, html, target);
};

export const dragDropHtmlExternallyToPath = (editor: Editor, html: string, path: number[]): void => {
  const target = Hierarchy.follow(TinyDom.body(editor), path).filter(SugarNode.isElement).getOrDie('Could not resolve path to drop target element');
  DragnDrop.dropItems([{ data: html, type: 'text/html' }], target);
};

