import { Throttler } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as SelectionBookmark from './SelectionBookmark';

type StoreThrottler = Throttler.Throttler<[]>;

const isManualNodeChange = (e) => {
  return e.type === 'nodechange' && e.selectionChange;
};

const registerPageMouseUp = (editor: Editor, throttledStore) => {
  const mouseUpPage = () => {
    throttledStore.throttle();
  };

  DOMUtils.DOM.bind(document, 'mouseup', mouseUpPage);

  editor.on('remove', () => {
    DOMUtils.DOM.unbind(document, 'mouseup', mouseUpPage);
  });
};

const registerMouseUp = (editor: Editor, throttledStore: StoreThrottler) => {
  editor.on('mouseup touchend', (_e) => {
    throttledStore.throttle();
  });
};

const registerEditorEvents = (editor: Editor, throttledStore: StoreThrottler) => {
  registerMouseUp(editor, throttledStore);

  editor.on('keyup NodeChange AfterSetSelectionRange', (e) => {
    if (!isManualNodeChange(e)) {
      SelectionBookmark.store(editor);
    }
  });
};

const register = (editor: Editor) => {
  const throttledStore = Throttler.first(() => {
    SelectionBookmark.store(editor);
  }, 0);

  editor.on('init', () => {
    if (editor.inline) {
      registerPageMouseUp(editor, throttledStore);
    }

    registerEditorEvents(editor, throttledStore);
  });

  editor.on('remove', () => {
    throttledStore.cancel();
  });
};

export {
  register
};
