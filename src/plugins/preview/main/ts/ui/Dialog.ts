/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Env from 'tinymce/core/Env';
import Tools from 'tinymce/core/util/Tools';
import Settings from '../api/Settings';
import IframeContent from './IframeContent';

var open = function (editor) {
  var sandbox = !Env.ie;
  var dialogHtml = '<iframe src="javascript:\'\'" frameborder="0"' + (sandbox ? ' sandbox="allow-scripts"' : '') + '></iframe>';
  var dialogWidth = Settings.getPreviewDialogWidth(editor);
  var dialogHeight = Settings.getPreviewDialogHeight(editor);

  editor.windowManager.open({
    title: 'Preview',
    width: dialogWidth,
    height: dialogHeight,
    html: dialogHtml,
    buttons: {
      text: 'Close',
      onclick: function (e) {
        e.control.parent().parent().close();
      }
    },
    onPostRender: function (e) {
      var iframeElm = e.control.getEl('body').firstChild;
      IframeContent.injectIframeContent(editor, iframeElm, sandbox);
    }
  });
};

export default {
  open: open
};