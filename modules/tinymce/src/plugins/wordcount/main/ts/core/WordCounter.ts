import { Throttler } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';

import { WordCountApi } from '../api/Api';
import * as Events from '../api/Events';

const updateCount = (editor: Editor, api: WordCountApi): void => {
  Events.fireWordCountUpdate(editor, api);
};

const setup = (editor: Editor, api: WordCountApi, delay: number): void => {
  const debouncedUpdate = Throttler.first(() => updateCount(editor, api), delay);

  editor.on('init', () => {
    updateCount(editor, api);
    Delay.setEditorTimeout(editor, () => {
      editor.on('SetContent BeforeAddUndo Undo Redo ViewUpdate keyup', debouncedUpdate.throttle);
    }, 0);
    editor.on('remove', debouncedUpdate.cancel);
  });
};

export {
  setup,
  updateCount
};
