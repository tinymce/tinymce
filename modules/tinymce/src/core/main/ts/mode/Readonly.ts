import { Arr, Optional, Strings, Type } from '@ephox/katamari';
import { Attribute, Class, Compare, SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import VK from '../api/util/VK';
import * as EditorFocus from '../focus/EditorFocus';

// Not quite sugar Class.toggle, it's more of a Class.set
const toggleClass = (elm: SugarElement<Element>, cls: string, state: boolean) => {
  if (Class.has(elm, cls) && !state) {
    Class.remove(elm, cls);
  } else if (state) {
    Class.add(elm, cls);
  }
};

const setEditorCommandState = (editor: Editor, cmd: string, state: boolean) => {
  try {
    // execCommand needs a string for the value, so convert the boolean to a string
    // See: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand#Parameters
    editor.getDoc().execCommand(cmd, false, String(state));
  } catch (ex) {
    // Ignore
  }
};

const setContentEditable = (elm: SugarElement<HTMLElement>, state: boolean) => {
  elm.dom.contentEditable = state ? 'true' : 'false';
};

const removeFakeSelection = (editor: Editor) => {
  Optional.from(editor.selection.getNode()).each((elm) => {
    elm.removeAttribute('data-mce-selected');
  });
};

const restoreFakeSelection = (editor: Editor) => {
  editor.selection.setRng(editor.selection.getRng());
};

const setCommonEditorCommands = (editor: Editor, state: boolean): void => {
  setEditorCommandState(editor, 'StyleWithCSS', state);
  setEditorCommandState(editor, 'enableInlineTableEditing', state);
  setEditorCommandState(editor, 'enableObjectResizing', state);
};

const setEditorReadonly = (editor: Editor) => {
  editor.readonly = true;
  editor.selection.controlSelection.hideResizeRect();
  editor._selectionOverrides.hideFakeCaret();
  removeFakeSelection(editor);
};

const unsetEditorReadonly = (editor: Editor, body: SugarElement<HTMLElement>) => {
  editor.readonly = false;
  if (editor.hasEditableRoot()) {
    setContentEditable(body, true);
  }
  setCommonEditorCommands(editor, false);
  if (EditorFocus.hasEditorOrUiFocus(editor)) {
    editor.focus();
  }
  restoreFakeSelection(editor);
  editor.nodeChanged();
};

const toggleReadOnly = (editor: Editor, state: boolean): void => {
  const body = SugarElement.fromDom(editor.getBody());
  toggleClass(body, 'mce-content-readonly', state);

  if (state) {
    setEditorReadonly(editor);
    if (editor.hasEditableRoot()) {
      setContentEditable(body, true);
    }
  } else {
    unsetEditorReadonly(editor, body);
  }
};

const isReadOnly = (editor: Editor): boolean => editor.readonly;

const isClickEvent = (e: Event): e is MouseEvent => e.type === 'click';

const allowedEvents: ReadonlyArray<string> = [ 'copy' ];

const isReadOnlyAllowedEvent = (e: Event) => Arr.contains(allowedEvents, e.type);

/*
* This function is exported for unit testing purposes only
*/
const getAnchorHrefOpt = (editor: Editor, elm: SugarElement<Node>): Optional<string> => {
  const isRoot = (elm: SugarElement<Node>) => Compare.eq(elm, SugarElement.fromDom(editor.getBody()));
  return SelectorFind.closest<HTMLAnchorElement>(elm, 'a', isRoot).bind((a) => Attribute.getOpt(a, 'href'));
};

const processReadonlyEvents = (editor: Editor, e: Event): void => {
  /*
    If an event is a click event on or within an anchor, and the CMD/CTRL key is
    not held, then we want to prevent default behaviour and either:
      a) scroll to the relevant bookmark
      b) open the link using default browser behaviour
  */
  if (isClickEvent(e) && !VK.metaKeyPressed(e)) {
    const elm = SugarElement.fromDom(e.target as Node);
    getAnchorHrefOpt(editor, elm).each((href) => {
      e.preventDefault();
      if (/^#/.test(href)) {
        const targetEl = editor.dom.select(`${href},[name="${Strings.removeLeading(href, '#')}"]`);
        if (targetEl.length) {
          editor.selection.scrollIntoView(targetEl[0], true);
        }
      } else {
        window.open(href, '_blank', 'rel=noopener noreferrer,menubar=yes,toolbar=yes,location=yes,status=yes,resizable=yes,scrollbars=yes');
      }
    });
  } else if (isReadOnlyAllowedEvent(e)) {
    editor.dispatch(e.type, e);
  }
};

const registerReadOnlySelectionBlockers = (editor: Editor): void => {
  editor.on('beforeinput paste cut dragend dragover draggesture dragdrop drop drag', (e) => {
    if (isReadOnly(editor)) {
      e.preventDefault();
    }
  });

  editor.on('BeforeExecCommand', (e) => {
    if ((e.command === 'Undo' || e.command === 'Redo') && isReadOnly(editor)) {
      e.preventDefault();
    }
  });

  editor.on('input', (e) => {
    if (!e.isComposing && isReadOnly(editor)) {
      const undoLevel = editor.undoManager.add();
      if (Type.isNonNullable(undoLevel)) {
        editor.undoManager.undo();
      }
    }
  });

  editor.on('compositionend', () => {
    if (isReadOnly(editor)) {
      const undoLevel = editor.undoManager.add();
      if (Type.isNonNullable(undoLevel)) {
        editor.undoManager.undo();
      }
    }
  });
};

export {
  isReadOnly,
  getAnchorHrefOpt,
  toggleReadOnly,
  processReadonlyEvents,
  registerReadOnlySelectionBlockers
};
