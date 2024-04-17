import { Fun } from '@ephox/katamari';
import { Class, Focus, SugarElement, SugarShadowDom } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import EditorManager from '../api/EditorManager';
import FocusManager from '../api/FocusManager';
import * as Options from '../api/Options';
import Delay from '../api/util/Delay';
import * as NodeType from '../dom/NodeType';
import * as SelectionRestore from '../selection/SelectionRestore';

let documentFocusInHandler: ((e: FocusEvent) => void) | null;
const DOM = DOMUtils.DOM;

const isEditorUIElement = (elm: Node): boolean => {
  // Since this can be overridden by third party we need to use the API reference here
  return NodeType.isElement(elm) && FocusManager.isEditorUIElement(elm);
};

const isEditorContentAreaElement = (elm: Element): boolean => {
  const classList = elm.classList;
  if (classList !== undefined) {
    // tox-edit-area__iframe === iframe container element
    // mce-content-body === inline body element
    return classList.contains('tox-edit-area') || classList.contains('tox-edit-area__iframe') || classList.contains('mce-content-body');
  } else {
    return false;
  }
};

const isUIElement = (editor: Editor, elm: Node): boolean => {
  const customSelector = Options.getCustomUiSelector(editor);
  const parent = DOM.getParent(elm, (elm) => {
    return (
      isEditorUIElement(elm) ||
      (customSelector ? editor.dom.is(elm, customSelector) : false)
    );
  });
  return parent !== null;
};

const getActiveElement = (editor: Editor): Element => {
  try {
    const root = SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getElement()));
    return Focus.active(root).fold(
      () => document.body,
      (x) => x.dom
    );
  } catch (ex) {
    // IE sometimes fails to get the activeElement when resizing table
    // TODO: Investigate this
    return document.body;
  }
};

const registerEvents = (editorManager: EditorManager, e: { editor: Editor }) => {
  const editor = e.editor;

  SelectionRestore.register(editor);

  const toggleContentAreaOnFocus = (editor: Editor, fn: (element: SugarElement<Element>, clazz: string) => void) => {
    // Inline editors have a different approach to highlight the content area on focus
    if (Options.shouldHighlightOnFocus(editor) && editor.inline !== true) {
      const contentArea = SugarElement.fromDom(editor.getContainer());
      fn(contentArea, 'tox-edit-focus');
    }
  };

  editor.on('focusin', () => {
    const focusedEditor = editorManager.focusedEditor;

    if (isEditorContentAreaElement(getActiveElement(editor))) {
      toggleContentAreaOnFocus(editor, Class.add);
    }

    if (focusedEditor !== editor) {
      if (focusedEditor) {
        focusedEditor.dispatch('blur', { focusedEditor: editor });
      }

      editorManager.setActive(editor);
      editorManager.focusedEditor = editor;
      editor.dispatch('focus', { blurredEditor: focusedEditor });
      editor.focus(true);
    }
  });

  editor.on('focusout', () => {
    Delay.setEditorTimeout(editor, () => {
      const focusedEditor = editorManager.focusedEditor;

      // Remove focus highlight when the content area is no longer the active editor element, or if the highlighted editor is not the current focused editor
      if (!isEditorContentAreaElement(getActiveElement(editor)) || focusedEditor !== editor) {
        toggleContentAreaOnFocus(editor, Class.remove);
      }

      // Still the same editor the blur was outside any editor UI
      if (!isUIElement(editor, getActiveElement(editor)) && focusedEditor === editor) {
        editor.dispatch('blur', { focusedEditor: null });
        editorManager.focusedEditor = null;
      }
    });
  });

  // Check if focus is moved to an element outside the active editor by checking if the target node
  // isn't within the body of the activeEditor nor a UI element such as a dialog child control
  if (!documentFocusInHandler) {
    documentFocusInHandler = (e: FocusEvent) => {
      const activeEditor = editorManager.activeEditor;

      if (activeEditor) {
        SugarShadowDom.getOriginalEventTarget(e).each((target) => {
          const elem = (target as Node);
          if (elem.ownerDocument === document) {
            // Fire a blur event if the element isn't a UI element
            if (elem !== document.body && !isUIElement(activeEditor, elem) && editorManager.focusedEditor === activeEditor) {
              activeEditor.dispatch('blur', { focusedEditor: null });
              editorManager.focusedEditor = null;
            }
          }
        });
      }
    };

    DOM.bind(document, 'focusin', documentFocusInHandler);
  }
};

const unregisterDocumentEvents = (editorManager: EditorManager, e: { editor: Editor }) => {
  if (editorManager.focusedEditor === e.editor) {
    editorManager.focusedEditor = null;
  }

  if (!editorManager.activeEditor && documentFocusInHandler) {
    DOM.unbind(document, 'focusin', documentFocusInHandler);
    documentFocusInHandler = null;
  }
};

const setup = (editorManager: EditorManager): void => {
  editorManager.on('AddEditor', Fun.curry(registerEvents, editorManager));
  editorManager.on('RemoveEditor', Fun.curry(unregisterDocumentEvents, editorManager));
};

export {
  setup,
  isEditorUIElement,
  isEditorContentAreaElement,
  isUIElement
};
