/**
 * ProcessFilters.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.paste.core.ProcessFilters',
  [
    'tinymce.plugins.paste.api.Events'
  ],
  function (Events) {
    var processResult = function (content, cancelled) {
      return { content: content, cancelled: cancelled };
    };

    var postProcessFilter = function (editor, html, internal) {
      var tempBody = editor.dom.create('div', { style: 'display:none' }, html);
      var postProcessArgs = Events.firePastePostProcess(editor, tempBody, internal);
      return processResult(postProcessArgs.node.innerHTML, postProcessArgs.isDefaultPrevented());
    };

    var process = function (editor, html, internal) {
      var beforeArgs = editor.fire('BeforePastePreProcess', { content: html, internal: internal });
      var preProcessArgs = Events.firePastePreProcess(editor, beforeArgs.content, internal);

      if (editor.hasEventListeners('PastePostProcess') && !preProcessArgs.isDefaultPrevented()) {
        return postProcessFilter(editor, preProcessArgs.content, internal);
      } else {
        return processResult(preProcessArgs.content, preProcessArgs.isDefaultPrevented());
      }
    };

    return {
      process: process
    };
  }
);
