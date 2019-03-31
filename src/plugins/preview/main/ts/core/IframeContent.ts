/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';

const getPreviewHtml = function (editor: Editor) {
  let headHtml = '';
  const encode = editor.dom.encode;
  const contentStyle = Settings.getContentStyle(editor);

  headHtml += '<base href="' + encode(editor.documentBaseURI.getURI()) + '">';

  if (contentStyle) {
    headHtml += '<style type="text/css">' + contentStyle + '</style>';
  }

  Tools.each(editor.contentCSS, function (url) {
    headHtml += '<link type="text/css" rel="stylesheet" href="' + encode(editor.documentBaseURI.toAbsolute(url)) + '">';
  });

  let bodyId = editor.settings.body_id || 'tinymce';
  if (bodyId.indexOf('=') !== -1) {
    bodyId = editor.getParam('body_id', '', 'hash');
    bodyId = bodyId[editor.id] || bodyId;
  }

  let bodyClass = editor.settings.body_class || '';
  if (bodyClass.indexOf('=') !== -1) {
    bodyClass = editor.getParam('body_class', '', 'hash');
    bodyClass = bodyClass[editor.id] || '';
  }

  const preventClicksOnLinksScript = (
    '<script>' +
    'document.addEventListener && document.addEventListener("click", function(e) {' +
    'for (var elm = e.target; elm; elm = elm.parentNode) {' +
    'if (elm.nodeName === "A") {' +
    'e.preventDefault();' +
    '}' +
    '}' +
    '}, false);' +
    '</script> '
  );

  const dirAttr = editor.settings.directionality ? ' dir="' + editor.settings.directionality + '"' : '';

  const previewHtml = (
    '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    headHtml +
    '</head>' +
    '<body id="' + encode(bodyId) + '" class="mce-content-body ' + encode(bodyClass) + '"' + encode(dirAttr) + '>' +
    editor.getContent() +
    preventClicksOnLinksScript +
    '</body>' +
    '</html>'
  );

  return previewHtml;
};

export default {
  getPreviewHtml,
};