/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../api/Settings';

// Todo: use a proper css loader here
const loadCss = function (editor, pluginUrl, addedInlineCss, addedCss) {
  let linkElm;
  const contentCss = Settings.getContentCss(editor);

  if (editor.inline && addedInlineCss.get()) {
    return;
  }

  if (!editor.inline && addedCss.get()) {
    return;
  }

  if (editor.inline) {
    addedInlineCss.set(true);
  } else {
    addedCss.set(true);
  }

  if (contentCss !== false) {
    linkElm = editor.dom.create('link', {
      rel: 'stylesheet',
      href: contentCss ? contentCss : pluginUrl + '/css/prism.css'
    });

    editor.getDoc().getElementsByTagName('head')[0].appendChild(linkElm);
  }
};

export default {
  loadCss
};