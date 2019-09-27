/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Event, HTMLElement, MouseEvent } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Attr, Class, Element, SelectorFilter } from '@ephox/sugar';
import Editor from '../api/Editor';
import EditorFocus from '../focus/EditorFocus';
import VK from '../api/util/VK';

const internalContentEditableAttr = 'data-mce-contenteditable';

// Not quite sugar Class.toggle, it's more of a Class.set
const toggleClass = (elm: Element, cls: string, state: boolean) => {
  if (Class.has(elm, cls) && state === false) {
    Class.remove(elm, cls);
  } else if (state) {
    Class.add(elm, cls);
  }
};

const setEditorCommandState = (editor: Editor, cmd: string, state: boolean) => {
  try {
    editor.getDoc().execCommand(cmd, false, state);
  } catch (ex) {
    // Ignore
  }
};

const setContentEditable = (elm: Element, state: boolean) => {
  elm.dom().contentEditable = state ? 'true' : 'false';
};

const switchOffContentEditableTrue = (elm: Element) => {
  Arr.each(SelectorFilter.descendants(elm, '*[contenteditable="true"]'), (elm) => {
    Attr.set(elm, internalContentEditableAttr, 'true');
    setContentEditable(elm, false);
  });
};

const switchOnContentEditableTrue = (elm: Element) => {
  Arr.each(SelectorFilter.descendants(elm, `*[${internalContentEditableAttr}="true"]`), (elm) => {
    Attr.remove(elm, internalContentEditableAttr);
    setContentEditable(elm, true);
  });
};

const removeFakeSelection = (editor: Editor) => {
  Option.from(editor.selection.getNode()).each((elm) => {
    elm.removeAttribute('data-mce-selected');
  });
};

const restoreFakeSelection = (editor: Editor) => {
  editor.selection.setRng(editor.selection.getRng());
};

const toggleReadOnly = (editor: Editor, state: boolean) => {
  const body = Element.fromDom(editor.getBody());

  toggleClass(body, 'mce-content-readonly', state);

  if (state) {
    editor.selection.controlSelection.hideResizeRect();
    editor._selectionOverrides.hideFakeCaret();
    removeFakeSelection(editor);
    editor.readonly = true;
    setContentEditable(body, false);
    switchOffContentEditableTrue(body);
  } else {
    editor.readonly = false;
    setContentEditable(body, true);
    switchOnContentEditableTrue(body);
    setEditorCommandState(editor, 'StyleWithCSS', false);
    setEditorCommandState(editor, 'enableInlineTableEditing', false);
    setEditorCommandState(editor, 'enableObjectResizing', false);
    if (EditorFocus.hasEditorOrUiFocus(editor)) {
      editor.focus();
    }
    restoreFakeSelection(editor);
    editor.nodeChanged();
  }
};

const isReadOnly = (editor: Editor) => editor.readonly === true;

const registerFilters = (editor: Editor) => {
  editor.parser.addAttributeFilter('contenteditable', (nodes) => {
    if (isReadOnly(editor)) {
      Arr.each(nodes, (node) => {
        node.attr(internalContentEditableAttr, node.attr('contenteditable'));
        node.attr('contenteditable', 'false');
      });
    }
  });

  editor.serializer.addAttributeFilter(internalContentEditableAttr, (nodes) => {
    if (isReadOnly(editor)) {
      Arr.each(nodes, (node) => {
        node.attr('contenteditable', node.attr(internalContentEditableAttr));
      });
    }
  });

  editor.serializer.addTempAttr(internalContentEditableAttr);
};

const registerReadOnlyContentFilters = (editor: Editor) => {
  if (editor.serializer) {
    registerFilters(editor);
  } else {
    editor.on('PreInit', () => { registerFilters(editor); });
  }
};

const isClickEvent = (e: Event): e is MouseEvent => e.type === 'click';

const preventReadOnlyEvents = (e: Event) => {
  const target = e.target as HTMLElement;
  if (isClickEvent(e) && target.tagName === 'A' && !VK.metaKeyPressed(e)) {
    e.preventDefault();
  }
};

const registerReadOnlySelectionBlockers = (editor: Editor) => {
  editor.on('ShowCaret', (e) => {
    if (isReadOnly(editor)) {
      e.preventDefault();
    }
  });

  editor.on('ObjectSelected', (e) => {
    if (isReadOnly(editor)) {
      e.preventDefault();
    }
  });
};

export {
  isReadOnly,
  toggleReadOnly,
  registerReadOnlyContentFilters,
  preventReadOnlyEvents,
  registerReadOnlySelectionBlockers
};
