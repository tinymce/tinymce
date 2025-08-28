import { Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import { EditorEvent } from '../api/util/EventDispatcher';

const setup = (editor: Editor): void => {
  const processEvent = <T>(f: (editor: Editor, event: EditorEvent<T>) => void) => (e: EditorEvent<T>) => {
    f(editor, e);
  };

  const preProcess = Options.getPastePreProcess(editor);
  if (Type.isFunction(preProcess)) {
    editor.on('PastePreProcess', processEvent(preProcess));
  }

  const postProcess = Options.getPastePostProcess(editor);
  if (Type.isFunction(postProcess)) {
    editor.on('PastePostProcess', processEvent(postProcess));
  }
};

export {
  setup
};
