/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Awareness, CursorPosition, Element, Insert, SelectorFind, Traverse } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const autocompleteSelector = '[data-mce-autocompleter]';

const create = (editor: Editor, range: Range): Element => {
  // Check if an existing wrapper exists (eg from undoing), otherwise
  // wrap the content in a span, so we know where to search between
  return detect(Element.fromDom(editor.selection.getNode())).getOrThunk(() => {
    // Create a wrapper
    const wrapper = Element.fromHtml('<span data-mce-autocompleter="1" data-mce-bogus="1"></span>', editor.getDoc());

    // Wrap the content
    Insert.append(wrapper, Element.fromDom(range.extractContents()));
    range.insertNode(wrapper.dom());
    Traverse.parent(wrapper).each((elm) => elm.dom().normalize());

    // Update the cursor position
    CursorPosition.last(wrapper).map((last) => {
      editor.selection.setCursorLocation(last.dom(), Awareness.getEnd(last));
    });

    return wrapper;
  });
};

const detect = (elm: Element): Option<Element> => {
  return SelectorFind.closest(elm, autocompleteSelector);
};

export {
  create,
  detect
};
