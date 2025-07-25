import Editor from './api/Editor';
import { EditorEvent } from './api/util/EventDispatcher';

// Map to track which editors have already been processed and disabled
const processedEditors = new WeakMap<Editor, boolean>();

const forceDisable = (editor: Editor): void => {
  // Check if we've already disabled the editor
  if (processedEditors.has(editor)) {
    return;
  }

  // Mark this editor as processed
  processedEditors.set(editor, true);

  const switchModeListener = () => {
    editor.on('SwitchMode', (e) => {
      const { mode } = e;
      if (mode !== 'readonly') {
        editor.mode.set('readonly');
      }
    });
  };

  const disabledStateChangeListener = () => {
    editor.on('DisabledStateChange', (e: EditorEvent<{ state: boolean }>) => {
      const { state } = e;
      if (!state) {
        e.preventDefault();
      }
    }, true);
  };

  if (editor.initialized) {
    // Set readonly before setting disabled as disabling editor prevents mode from being changed
    if (!editor.removed) {
      editor.mode.set('readonly');
    }
    editor.options.set('disabled', true);
  } else {
    editor.on('init', () => {
      // Set readonly before setting disabled as disabling editor prevents mode from being changed
      if (!editor.removed) {
        editor.mode.set('readonly');
      }
      editor.options.set('disabled', true);
    });
  }

  disabledStateChangeListener();
  switchModeListener();
};

export {
  forceDisable
};
