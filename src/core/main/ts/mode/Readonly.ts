/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Class, Element, SelectorFilter, Attr } from '@ephox/sugar';
import Editor from '../api/Editor';
import { Arr } from '@ephox/katamari';

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

const toggleReadOnly = (editor: Editor, state: boolean) => {
  const body = Element.fromDom(editor.getBody());

  toggleClass(body, 'mce-content-readonly', state);

  if (state) {
    editor.selection.controlSelection.hideResizeRect();
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
    editor.focus();
    editor.nodeChanged();
  }
};

const isReadOnly = (editor: Editor) => editor.readonly === true;

const registerFilters = (editor: Editor) => {
  editor.serializer.addAttributeFilter(internalContentEditableAttr, (nodes) => {
    Arr.each(nodes, (node) => {
      node.attr('contenteditable', node.attr(internalContentEditableAttr));
    });
  });

  editor.serializer.addTempAttr(internalContentEditableAttr);
};

const registerReadonlyContentFilters = (editor: Editor) => {
  if (editor.serializer) {
    registerFilters(editor);
  } else {
    editor.on('PreInit', () => { registerFilters(editor); });
  }
};

export {
  isReadOnly,
  toggleReadOnly,
  registerReadonlyContentFilters
};
