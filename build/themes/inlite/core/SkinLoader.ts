/**
 * SkinLoader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Events from '../api/Events';
import Settings from '../api/Settings';
import { Editor } from 'tinymce/core/api/Editor';

const fireSkinLoaded = function (editor: Editor, callback: Function) {
  const done = function () {
    editor._skinLoaded = true;
    Events.fireSkinLoaded(editor);
    callback();
  };

  if (editor.initialized) {
    done();
  } else {
    editor.on('init', done);
  }
};

const load = function (editor: Editor, callback: Function) {
  const skinUrl = Settings.getSkinUrl(editor);

  const done = function () {
    fireSkinLoaded(editor, callback);
  };

  if (Settings.isSkinDisabled(editor)) {
    done();
  } else {
    DOMUtils.DOM.styleSheetLoader.load(skinUrl + '/skin.min.css', done);
    editor.contentCSS.push(skinUrl + '/content.inline.min.css');
  }
};

export default {
  load
};