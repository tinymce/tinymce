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

var processResult = function (content, cancelled) {
  return { content: content, cancelled: cancelled };
};

var postProcessFilter = function (editor, html, internal, isWordHtml) {
  var tempBody = editor.dom.create('div', { style: 'display:none' }, html);
  var postProcessArgs = Events.firePastePostProcess(editor, tempBody, internal, isWordHtml);
  return processResult(postProcessArgs.node.innerHTML, postProcessArgs.isDefaultPrevented());
};

var filterContent = function (editor, content, internal, isWordHtml) {
  var preProcessArgs = Events.firePastePreProcess(editor, content, internal, isWordHtml);

  if (editor.hasEventListeners('PastePostProcess') && !preProcessArgs.isDefaultPrevented()) {
    return postProcessFilter(editor, preProcessArgs.content, internal, isWordHtml);
  } else {
    return processResult(preProcessArgs.content, preProcessArgs.isDefaultPrevented());
  }
};

var process = function (editor, html, internal) {
  var isWordHtml = WordFilter.isWordContent(html);
  var content = isWordHtml ? WordFilter.preProcess(editor, html) : html;

  return filterContent(editor, content, internal, isWordHtml);
};

export default <any> {
  process: process
};