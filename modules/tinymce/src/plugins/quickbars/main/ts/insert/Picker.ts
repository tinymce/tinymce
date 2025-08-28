import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const pickFile = (editor: Editor): Promise<File[]> => new Promise((resolve) => {
  let resolved = false;

  const fileInput: HTMLInputElement = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.position = 'fixed';
  fileInput.style.left = '0';
  fileInput.style.top = '0';
  fileInput.style.opacity = '0.001';
  document.body.appendChild(fileInput);

  const resolveFileInput = (value: File[]) => {
    if (!resolved) {
      fileInput.parentNode?.removeChild(fileInput);
      resolved = true;
      resolve(value);
    }
  };

  const changeHandler = (e: Event) => {
    resolveFileInput(Array.prototype.slice.call((e.target as HTMLInputElement).files));
  };

  fileInput.addEventListener('input', changeHandler);
  fileInput.addEventListener('change', changeHandler);

  const cancelHandler = (e: EditorEvent<{}>) => {
    const cleanup = () => {
      resolveFileInput([]);
    };

    if (!resolved ) {
      if (e.type === 'focusin') {
        // Chrome will fire `focusin` before the input `change` event
        Delay.setEditorTimeout(editor, cleanup, 1000);
      } else {
        cleanup();
      }
    }

    editor.off('focusin remove', cancelHandler);
  };

  editor.on('focusin remove', cancelHandler);

  fileInput.click();
});

export {
  pickFile
};
