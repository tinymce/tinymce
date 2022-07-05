import { Arr, Strings } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import Env from '../api/Env';
import * as Events from '../api/Events';
import * as Options from '../api/Options';
import Delay from '../api/util/Delay';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import * as Empty from '../dom/Empty';

const nonTypingKeycodes = [
  // tab, esc, home, end
  9, 27, VK.HOME, VK.END,
  // pause, capslock, print screen, numlock, scroll lock
  19, 20, 44, 144, 145,
  // page up/down, insert
  33, 34, 45,
  // alt, shift, ctrl
  16, 17, 18,
  // meta/windows key
  91, 92, 93,
  // direction
  VK.DOWN, VK.UP, VK.LEFT, VK.RIGHT
].concat(
  // Meta key on firefox is different
  Env.browser.isFirefox() ? [ 224 ] : []
);

const placeholderAttr = 'data-mce-placeholder';

const isKeyboardEvent = (e: EditorEvent<any>): e is EditorEvent<KeyboardEvent> =>
  e.type === 'keydown' || e.type === 'keyup';

const isDeleteEvent = (e: EditorEvent<KeyboardEvent>): boolean => {
  const keyCode = e.keyCode;
  return keyCode === VK.BACKSPACE || keyCode === VK.DELETE;
};

const isNonTypingKeyboardEvent = (e: EditorEvent<unknown>): boolean => {
  if (isKeyboardEvent(e)) {
    const keyCode = e.keyCode;
    // Ctrl/Meta/Alt key pressed, F1-12 or non typing keycode
    return !isDeleteEvent(e) && (VK.metaKeyPressed(e) || e.altKey || keyCode >= 112 && keyCode <= 123 || Arr.contains(nonTypingKeycodes, keyCode));
  } else {
    return false;
  }
};

const isTypingKeyboardEvent = (e: EditorEvent<unknown>) =>
  // 229 === Unidentified, so since we don't know what it is treat it as a non typing event on keyup but as a typing event on keydown
  // Android will generally always send a 229 keycode since it uses an IME to input text
  isKeyboardEvent(e) && !(isDeleteEvent(e) || e.type === 'keyup' && e.keyCode === 229);

const isVisuallyEmpty = (dom: DOMUtils, rootElm: Element, forcedRootBlock: string): boolean => {
  // Note: Don't use DOMUtils.isEmpty() here as it treats empty format caret nodes as non empty nodes
  if (Empty.isEmpty(SugarElement.fromDom(rootElm), false)) {
    // Ensure the node matches the forced_root_block setting, as the content could be an empty list, etc...
    // and also check that the content isn't indented
    const firstElement = rootElm.firstElementChild;
    if (!firstElement) {
      return true;
    } else if (dom.getStyle(rootElm.firstElementChild, 'padding-left') || dom.getStyle(rootElm.firstElementChild, 'padding-right')) {
      return false;
    } else {
      return forcedRootBlock === firstElement.nodeName.toLowerCase();
    }
  } else {
    return false;
  }
};

const setup = (editor: Editor): void => {
  const dom = editor.dom;
  const rootBlock = Options.getForcedRootBlock(editor);
  const placeholder = Options.getPlaceholder(editor) ?? '';

  const updatePlaceholder = (e: EditorEvent<unknown>, initial?: boolean) => {
    if (isNonTypingKeyboardEvent(e)) {
      return;
    }

    // Check to see if we should show the placeholder
    const body = editor.getBody();
    const showPlaceholder = isTypingKeyboardEvent(e) ? false : isVisuallyEmpty(dom, body, rootBlock);

    // Update the attribute as required
    const isPlaceholderShown = dom.getAttrib(body, placeholderAttr) !== '';
    if (isPlaceholderShown !== showPlaceholder || initial) {
      dom.setAttrib(body, placeholderAttr, showPlaceholder ? placeholder : null);

      // Also set the aria-placeholder attribute for screen readers
      dom.setAttrib(body, 'aria-placeholder', showPlaceholder ? placeholder : null);

      Events.firePlaceholderToggle(editor, showPlaceholder);

      // Swap the key listener state
      editor.on(showPlaceholder ? 'keydown' : 'keyup', updatePlaceholder);
      editor.off(showPlaceholder ? 'keyup' : 'keydown', updatePlaceholder);
    }
  };

  if (Strings.isNotEmpty(placeholder)) {
    editor.on('init', (e) => {
      // Setup the initial state
      updatePlaceholder(e, true);
      editor.on('change SetContent ExecCommand', updatePlaceholder);

      // TINY-4828: Update the placeholder after pasting content. This needs to use a timeout as
      // the browser doesn't update the dom until after the paste event has fired
      editor.on('paste', (e) => Delay.setEditorTimeout(editor, () => updatePlaceholder(e)));
    });
  }
};

export {
  isVisuallyEmpty, // Exported for testing
  setup
};
