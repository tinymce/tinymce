import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Delay from 'tinymce/core/api/util/Delay';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const pickFile = (editor: Editor): Promise<File[]> => new Promise((resolve) => {
  const fileInput: HTMLInputElement = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.position = 'fixed';
  fileInput.style.left = '0';
  fileInput.style.top = '0';
  fileInput.style.opacity = '0.001';
  document.body.appendChild(fileInput);

  const changeHandler = (e: Event) => {
    resolve(Array.prototype.slice.call((e.target as HTMLInputElement).files));
  };

  fileInput.addEventListener('change', changeHandler);

  const cancelHandler = (e: EditorEvent<{}>) => {
    const cleanup = () => {
      resolve([]);
      fileInput.parentNode?.removeChild(fileInput);
    };

    // Android will fire focusin before the input change event
    // so we need to do a slight delay to get outside the event loop
    if (Env.os.isAndroid() && e.type !== 'remove') {
      Delay.setEditorTimeout(editor, cleanup, 0);
    } else {
      cleanup();
    }
    editor.off('focusin remove', cancelHandler);
  };

  editor.on('focusin remove', cancelHandler);

  fileInput.click();
});

export {
  pickFile
};
