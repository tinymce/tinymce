import Editor from '../api/Editor';
import { normalizeNbspsInEditor } from './Nbsps';

const setup = (editor: Editor): void => {
  editor.on('input', (e) => {
    // We only care about non composing inputs since moving the caret or modifying the text node will blow away the IME
    if (!e.isComposing) {
      normalizeNbspsInEditor(editor);
    }
  });
};

export {
  setup
};
