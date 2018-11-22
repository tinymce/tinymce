/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from 'tinymce/core/api/Env';
import Settings from '../api/Settings';
import IframeContent from './IframeContent';

const open = function (editor) {
  const sandbox = !Env.ie;
  const dialogHtml = '<iframe src="" frameborder="0"' + (sandbox ? ' sandbox="allow-scripts"' : '') + '></iframe>';
  const dialogWidth = Settings.getPreviewDialogWidth(editor);
  const dialogHeight = Settings.getPreviewDialogHeight(editor);

  editor.windowManager.open({
    title: 'Preview',
    width: dialogWidth,
    height: dialogHeight,
    html: dialogHtml,
    buttons: {
      text: 'Close',
      onclick (e) {
        e.control.parent().parent().close();
      }
    },
    onPostRender (e) {
      const iframeElm = e.control.getEl('body').firstChild;
      IframeContent.injectIframeContent(editor, iframeElm, sandbox);
    }
  });
};

export default {
  open
};