import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';
import Tools from 'tinymce/core/api/util/Tools';

import * as Events from '../api/Events';
import * as Options from '../api/Options';

const isEmpty = (editor: Editor, html?: string): boolean => {
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

const hasDraft = (editor: Editor): boolean => {
  const time = parseInt(LocalStorage.getItem(Options.getAutoSavePrefix(editor) + 'time') ?? '0', 10) || 0;

  if (new Date().getTime() - time > Options.getAutoSaveRetention(editor)) {
    removeDraft(editor, false);
    return false;
  }

  return true;
};

const removeDraft = (editor: Editor, fire?: boolean): void => {
  const prefix = Options.getAutoSavePrefix(editor);

  LocalStorage.removeItem(prefix + 'draft');
  LocalStorage.removeItem(prefix + 'time');

  if (fire !== false) {
    Events.fireRemoveDraft(editor);
  }
};

const storeDraft = (editor: Editor): void => {
  const prefix = Options.getAutoSavePrefix(editor);

  if (!isEmpty(editor) && editor.isDirty()) {
    LocalStorage.setItem(prefix + 'draft', editor.getContent({ format: 'raw', no_events: true }));
    LocalStorage.setItem(prefix + 'time', new Date().getTime().toString());
    Events.fireStoreDraft(editor);
  }
};

const restoreDraft = (editor: Editor): void => {
  const prefix = Options.getAutoSavePrefix(editor);

  if (hasDraft(editor)) {
    editor.setContent(LocalStorage.getItem(prefix + 'draft') ?? '', { format: 'raw' });
    Events.fireRestoreDraft(editor);
  }
};

const startStoreDraft = (editor: Editor): void => {
  const interval = Options.getAutoSaveInterval(editor);
  Delay.setEditorInterval(editor, () => {
    storeDraft(editor);
  }, interval);
};

const restoreLastDraft = (editor: Editor): void => {
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
