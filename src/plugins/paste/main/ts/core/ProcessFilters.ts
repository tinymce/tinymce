/**
 * ProcessFilters.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Events from '../api/Events';
import WordFilter from './WordFilter';

const processResult = function (content, cancelled) {
  return { content, cancelled };
};

const postProcessFilter = function (editor, html, internal, isWordHtml) {
  const tempBody = editor.dom.create('div', { style: 'display:none' }, html);
  const postProcessArgs = Events.firePastePostProcess(editor, tempBody, internal, isWordHtml);
  return processResult(postProcessArgs.node.innerHTML, postProcessArgs.isDefaultPrevented());
};

const filterContent = function (editor, content, internal, isWordHtml) {
  const preProcessArgs = Events.firePastePreProcess(editor, content, internal, isWordHtml);

  if (editor.hasEventListeners('PastePostProcess') && !preProcessArgs.isDefaultPrevented()) {
    return postProcessFilter(editor, preProcessArgs.content, internal, isWordHtml);
  } else {
    return processResult(preProcessArgs.content, preProcessArgs.isDefaultPrevented());
  }
};

const process = function (editor, html, internal) {
  const isWordHtml = WordFilter.isWordContent(html);
  const content = isWordHtml ? WordFilter.preProcess(editor, html) : html;

  return filterContent(editor, content, internal, isWordHtml);
};

export default {
  process
};