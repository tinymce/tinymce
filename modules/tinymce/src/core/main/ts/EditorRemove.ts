import { Optional, Type } from '@ephox/katamari';

import DOMUtils from './api/dom/DOMUtils';
import EditorSelection from './api/dom/Selection';
import Editor from './api/Editor';
import * as Events from './api/Events';

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

const DOM = DOMUtils.DOM;

const restoreOriginalStyles = (editor: Editor) => {
  DOM.setStyle(editor.id, 'display', editor.orgDisplay);
};

const safeDestroy = (x: any) => Optional.from(x).each((x) => x.destroy());

const clearDomReferences = (editor: Editor) => {
  const ed = editor as Nullable<Editor>;
  ed.contentAreaContainer = ed.formElement = ed.container = ed.editorContainer = null;
  ed.bodyElement = ed.contentDocument = ed.contentWindow = null;
  ed.iframeElement = ed.targetElm = null;

  const selection = editor.selection as Nullable<EditorSelection>;
  if (selection) {
    const dom = selection.dom as Nullable<DOMUtils>;
    ed.selection = selection.win = selection.dom = dom.doc = null;
  }
};

const restoreForm = (editor: Editor) => {
  const form = editor.formElement as HTMLFormElement & { _mceOldSubmit?: VoidFunction };
  if (form) {
    if (form._mceOldSubmit) {
      form.submit = form._mceOldSubmit;
      delete form._mceOldSubmit;
    }

    DOM.unbind(form, 'submit reset', editor.formEventDelegate);
  }
};

const remove = (editor: Editor): void => {
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
    if (editor.hasHiddenInput && Type.isNonNullable(element?.nextSibling)) {
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
