import { Editor } from 'tinymce/core/api/Editor';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Option } from '@ephox/katamari';

const DOM = DOMUtils.DOM;

const restoreOriginalStyles = (editor: Editor) => {
  const body = editor.getBody();
  if (body && editor.orgDisplay) {
    DOM.setStyle(editor.id, 'display', editor.orgDisplay);
    editor.getBody().onload = null; // Prevent #6816
  }
};

const safeDestroy = (x: any) => Option.from(x).each((x) => x.destroy());

const remove =  (editor: Editor): void => {
  if (!editor.removed) {
    const { _selectionOverrides, editorUpload } = editor;
    const body = editor.getBody();
    if (body) {
      editor.save();
    }
    editor.removed = 1;
    editor.unbindAllNativeEvents();

    // Remove any hidden input
    if (editor.hasHiddenInput) {
      DOM.remove(editor.getElement().nextSibling);
    }

    if (!editor.inline) {
      restoreOriginalStyles(editor);
    }

    editor.fire('remove');

    editor.editorManager.remove(editor);
    DOM.remove(editor.getContainer());

    safeDestroy(_selectionOverrides);
    safeDestroy(editorUpload);

    editor.destroy();
  }
};

const destroy = (editor: Editor, automatic?: boolean): void => {
  let form;
  const { selection, dom } = editor;

  // One time is enough
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

    // Destroy controls, selection and dom
    safeDestroy(selection);
    safeDestroy(selection);
    safeDestroy(dom);
  }

  form = editor.formElement;
  if (form) {
    if (form._mceOldSubmit) {
      form.submit = form._mceOldSubmit;
      form._mceOldSubmit = null;
    }

    DOM.unbind(form, 'submit reset', editor.formEventDelegate);
  }

  editor.contentAreaContainer = editor.formElement = editor.container = editor.editorContainer = null;
  editor.bodyElement = editor.contentDocument = editor.contentWindow = null;
  editor.iframeElement = editor.targetElm = null;

  if (editor.selection) {
    editor.selection = editor.selection.win = editor.selection.dom = editor.selection.dom.doc = null;
  }

  editor.destroyed = 1;
};

export {
  remove,
  destroy
};