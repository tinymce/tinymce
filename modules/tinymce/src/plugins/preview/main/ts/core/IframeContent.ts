/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';

const getPreviewHtml = (editor: Editor) => {
  let headHtml = '';
  const encode = editor.dom.encode;
  const contentStyle = Settings.getContentStyle(editor);

  headHtml += '<base href="' + encode(editor.documentBaseURI.getURI()) + '">';

  const cors = Settings.shouldUseContentCssCors(editor) ? ' crossorigin="anonymous"' : '';
  Tools.each(editor.contentCSS, (url) => {
    headHtml += '<link type="text/css" rel="stylesheet" href="' + encode(editor.documentBaseURI.toAbsolute(url)) + '"' + cors + '>';
  });

  if (contentStyle) {
    headHtml += '<style type="text/css">' + contentStyle + '</style>';
  }

  const bodyId = Settings.getBodyId(editor);

  const bodyClass = Settings.getBodyClass(editor);

  const isMetaKeyPressed = Env.mac ? 'e.metaKey' : 'e.ctrlKey && !e.altKey';

  const preventClicksOnLinksScript = (
    '<script>' +
    'document.addEventListener && document.addEventListener("click", function(e) {' +
    'for (var elm = e.target; elm; elm = elm.parentNode) {' +
    'if (elm.nodeName === "A" && !(' + isMetaKeyPressed + ')) {' +
    'e.preventDefault();' +
    '}' +
    '}' +
    '}, false);' +
    '</script> '
  );

  const directionality = editor.getBody().dir;
  const dirAttr = directionality ? ' dir="' + encode(directionality) + '"' : '';

  const previewHtml = (
    '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    headHtml +
    '</head>' +
    '<body id="' + encode(bodyId) + '" class="mce-content-body ' + encode(bodyClass) + '"' + dirAttr + '>' +
    editor.getContent() +
    preventClicksOnLinksScript +
    '</body>' +
    '</html>'
  );

  return previewHtml;
};

export {
  getPreviewHtml
};
