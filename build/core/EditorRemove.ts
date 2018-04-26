import { Editor } from 'tinymce/core/api/Editor';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Option } from '@ephox/katamari';
import Events from 'tinymce/core/api/Events';

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
      editor.save();
    }
    editor.removed = true;
    editor.unbindAllNativeEvents();

    // Remove any hidden input
    if (editor.hasHiddenInput && element) {
      DOM.remove(element.nextSibling);
    }

    if (!editor.inline && body) {
      restoreOriginalStyles(editor);
    }

    Events.fireRemove(editor);

    editor.editorManager.remove(editor);
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