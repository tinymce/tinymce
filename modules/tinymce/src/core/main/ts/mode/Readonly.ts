/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional, Strings } from '@ephox/katamari';
import { Attribute, Class, Compare, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import VK from '../api/util/VK';
import * as EditorFocus from '../focus/EditorFocus';

const internalContentEditableAttr = 'data-mce-contenteditable';

// Not quite sugar Class.toggle, it's more of a Class.set
const toggleClass = (elm: SugarElement, cls: string, state: boolean) => {
  if (Class.has(elm, cls) && state === false) {
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

const setContentEditable = (elm: SugarElement, state: boolean) => {
  elm.dom.contentEditable = state ? 'true' : 'false';
};

const switchOffContentEditableTrue = (elm: SugarElement) => {
  Arr.each(SelectorFilter.descendants(elm, '*[contenteditable="true"]'), (elm) => {
    Attribute.set(elm, internalContentEditableAttr, 'true');
    setContentEditable(elm, false);
  });
};

const switchOnContentEditableTrue = (elm: SugarElement) => {
  Arr.each(SelectorFilter.descendants(elm, `*[${internalContentEditableAttr}="true"]`), (elm) => {
    Attribute.remove(elm, internalContentEditableAttr);
    setContentEditable(elm, true);
  });
};

const removeFakeSelection = (editor: Editor) => {
  Optional.from(editor.selection.getNode()).each((elm) => {
    elm.removeAttribute('data-mce-selected');
  });
};

const restoreFakeSelection = (editor: Editor) => {
  editor.selection.setRng(editor.selection.getRng());
};

const toggleReadOnly = (editor: Editor, state: boolean) => {
  const body = SugarElement.fromDom(editor.getBody());

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

const isReadOnly = (editor: Editor) => editor.readonly;

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
    editor.on('PreInit', () => {
      registerFilters(editor);
    });
  }
};

const isClickEvent = (e: Event): e is MouseEvent => e.type === 'click';

/*
* This function is exported for unit testing purposes only
*/
const getAnchorHrefOpt = (editor: Editor, elm: SugarElement): Optional<string> => {
  const isRoot = (elm: SugarElement<Node>) => Compare.eq(elm, SugarElement.fromDom(editor.getBody()));
  return SelectorFind.closest<HTMLAnchorElement>(elm, 'a', isRoot).bind((a) => Attribute.getOpt(a, 'href'));
};

const processReadonlyEvents = (editor: Editor, e: Event) => {
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
  getAnchorHrefOpt,
  toggleReadOnly,
  registerReadOnlyContentFilters,
  processReadonlyEvents,
  registerReadOnlySelectionBlockers
};
