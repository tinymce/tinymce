/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Events from '../api/Events';
import WordFilter from './WordFilter';
import Editor from 'tinymce/core/api/Editor';

const processResult = function (content, cancelled) {
  return { content, cancelled };
};

const postProcessFilter = function (editor: Editor, html: string, internal: boolean, isWordHtml: boolean) {
  const tempBody = editor.dom.create('div', { style: 'display:none' }, html);
  const postProcessArgs = Events.firePastePostProcess(editor, tempBody, internal, isWordHtml);
  return processResult(postProcessArgs.node.innerHTML, postProcessArgs.isDefaultPrevented());
};

const filterContent = function (editor: Editor, content: string, internal: boolean, isWordHtml: boolean) {
  const preProcessArgs = Events.firePastePreProcess(editor, content, internal, isWordHtml);

  if (editor.hasEventListeners('PastePostProcess') && !preProcessArgs.isDefaultPrevented()) {
    return postProcessFilter(editor, preProcessArgs.content, internal, isWordHtml);
  } else {
    return processResult(preProcessArgs.content, preProcessArgs.isDefaultPrevented());
  }
};

const process = function (editor: Editor, html: string, internal: boolean) {
  const isWordHtml = WordFilter.isWordContent(html);
  const content = isWordHtml ? WordFilter.preProcess(editor, html) : html;

  return filterContent(editor, content, internal, isWordHtml);
};

export default {
  process
};