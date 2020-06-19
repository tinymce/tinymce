/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';
import Tools from 'tinymce/core/api/util/Tools';
import * as Events from '../api/Events';
import * as Settings from '../api/Settings';
import { Type } from '@ephox/katamari';
import { DOMParser } from '@ephox/dom-globals';

const isEmpty = (editor: Editor, html?: string) => {
  if (Type.isUndefined(html)) {
    return editor.dom.isEmpty(editor.getBody());
  } else {
    const trimmedHtml = Tools.trim(html);

    if (trimmedHtml === '') {
      return true;
    } else {
      const fragment = new DOMParser().parseFromString(trimmedHtml, 'text/html');
      return editor.dom.isEmpty(fragment);
    }
  }
};

const hasDraft = (editor: Editor) => {
  const time = parseInt(LocalStorage.getItem(Settings.getAutoSavePrefix(editor) + 'time'), 10) || 0;

  if (new Date().getTime() - time > Settings.getAutoSaveRetention(editor)) {
    removeDraft(editor, false);
    return false;
  }

  return true;
};

const removeDraft = (editor: Editor, fire?: boolean) => {
  const prefix = Settings.getAutoSavePrefix(editor);

  LocalStorage.removeItem(prefix + 'draft');
  LocalStorage.removeItem(prefix + 'time');

  if (fire !== false) {
    Events.fireRemoveDraft(editor);
  }
};

const storeDraft = (editor: Editor) => {
  const prefix = Settings.getAutoSavePrefix(editor);

  if (!isEmpty(editor) && editor.isDirty()) {
    LocalStorage.setItem(prefix + 'draft', editor.getContent({ format: 'raw', no_events: true }));
    LocalStorage.setItem(prefix + 'time', new Date().getTime().toString());
    Events.fireStoreDraft(editor);
  }
};

const restoreDraft = (editor: Editor) => {
  const prefix = Settings.getAutoSavePrefix(editor);

  if (hasDraft(editor)) {
    editor.setContent(LocalStorage.getItem(prefix + 'draft'), { format: 'raw' });
    Events.fireRestoreDraft(editor);
  }
};

const startStoreDraft = (editor: Editor) => {
  const interval = Settings.getAutoSaveInterval(editor);
  Delay.setInterval(() => {
    if (!editor.removed) {
      storeDraft(editor);
    }
  }, interval);
};

const restoreLastDraft = (editor: Editor) => {
  editor.undoManager.transact(() => {
    restoreDraft(editor);
    removeDraft(editor);
  });

  editor.focus();
};

export {
  isEmpty,
  hasDraft,
  removeDraft,
  storeDraft,
  restoreDraft,
  startStoreDraft,
  restoreLastDraft
};
