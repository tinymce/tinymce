import { Type } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';

const displayErrorMessage = (editor: Editor, message: string): void => {
  editor.notificationManager.open({
    text: message,
    type: 'error'
  });
};

const save = (editor: Editor): void => {
  const formObj = DOMUtils.DOM.getParent(editor.id, 'form');

  if (Options.enableWhenDirty(editor) && !editor.isDirty()) {
    return;
  }

  editor.save();

  // Use callback instead
  const onSaveCallback = Options.getOnSaveCallback(editor);
  if (Type.isFunction(onSaveCallback)) {
    onSaveCallback.call(editor, editor);
    editor.nodeChanged();
    return;
  }

  if (formObj) {
    editor.setDirty(false);

    // TODO: TINY-6105 this is probably broken, as an event should be passed to `onsubmit`
    // so we need to investigate this at some point
    if (!formObj.onsubmit || (formObj as any).onsubmit()) {
      if (typeof formObj.submit === 'function') {
        formObj.submit();
      } else {
        displayErrorMessage(editor, 'Error: Form submit field collision.');
      }
    }

    editor.nodeChanged();
  } else {
    displayErrorMessage(editor, 'Error: No form element found.');
  }
};

const cancel = (editor: Editor): void => {
  const h = Tools.trim(editor.startContent);

  // Use callback instead
  const onCancelCallback = Options.getOnCancelCallback(editor);
  if (Type.isFunction(onCancelCallback)) {
    onCancelCallback.call(editor, editor);
    return;
  }

  // Reset the editor content back to the initial state
  editor.resetContent(h);
};

export {
  save,
  cancel
};
