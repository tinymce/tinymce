/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import Editor from './api/Editor';
import DOMUtils from './api/dom/DOMUtils';
import * as Events from './api/Events';

const DOM = DOMUtils.DOM;

const restoreOriginalStyles = (editor: Editor) => {
  DOM.setStyle(editor.id, 'display', editor.orgDisplay);
};

const safeDestroy = (x: any) => Option.from(x).each((x) => x.destroy());

const clearDomReferences = (editor: Editor) => {
  editor.contentAreaContainer = editor.formElement = editor.container = editor.editorContainer = null;
  editor.bodyElement = editor.contentDocument = editor.contentWindow = null;
  editor.iframeElement = editor.targetElm = null;

  if (editor.selection) {
    editor.selection = editor.selection.win = editor.selection.dom = editor.selection.dom.doc = null;
  }
};

const restoreForm = (editor: Editor) => {
  const form = editor.formElement as any;
  if (form) {
    if (form._mceOldSubmit) {
      form.submit = form._mceOldSubmit;
      form._mceOldSubmit = null;
    }

    DOM.unbind(form, 'submit reset', editor.formEventDelegate);
  }
};

const remove =  (editor: Editor): void => {
  if (!editor.removed) {
    const { _selectionOverrides, editorUpload } = editor;
    const body = editor.getBody();
    const element = editor.getElement();
    if (body) {
      editor.save({ is_removing: true });
    }
    editor.removed = true;
    editor.unbindAllNativeEvents();

    // Remove any hidden input
    if (editor.hasHiddenInput && element) {
      DOM.remove(element.nextSibling);
    }

    Events.fireRemove(editor);
    editor.editorManager.remove(editor);

    if (!editor.inline && body) {
      restoreOriginalStyles(editor);
    }

    Events.fireDetach(editor);
    DOM.remove(editor.getContainer());

    safeDestroy(_selectionOverrides);
    safeDestroy(editorUpload);

    editor.destroy();
  }
};

const destroy = (editor: Editor, automatic?: boolean): void => {
  const { selection, dom } = editor;

  if (editor.destroyed) {
    return;
  }

  // If user manually calls destroy and not remove
  // Users seems to have logic that calls destroy instead of remove
  if (!automatic && !editor.removed) {
    editor.remove();
    return;
  }

  if (!automatic) {
    editor.editorManager.off('beforeunload', editor._beforeUnload);

    // Manual destroy
    if (editor.theme && editor.theme.destroy) {
      editor.theme.destroy();
    }

    safeDestroy(selection);
    safeDestroy(dom);
  }

  restoreForm(editor);
  clearDomReferences(editor);

  editor.destroyed = true;
};

export {
  remove,
  destroy
};
