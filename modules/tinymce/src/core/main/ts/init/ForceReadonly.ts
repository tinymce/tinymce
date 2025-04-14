import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';

const forceReadonly = (editor: Editor): void => {
  editor.options.set('disabled', true);

  const switchModeListener = () => {
    editor.on('SwitchMode', ({ mode }: { mode: string }) => {
      if (mode !== 'readonly') {
        editor.mode.set('readonly');
      }
    });
  };

  if (editor.initialized) {
    switchModeListener();
  } else {
    editor.on('init', () => {
      switchModeListener();
    });
  }

  editor.on('DisabledStateChange', (e: EditorEvent<{}>) => {
    e.preventDefault();
  }, true);
};

export {
  forceReadonly
};
