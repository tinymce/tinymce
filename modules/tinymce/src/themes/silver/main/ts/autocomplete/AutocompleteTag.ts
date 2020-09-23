/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { Awareness, CursorPosition, Insert, SelectorFind, SugarElement, Traverse } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const autocompleteSelector = '[data-mce-autocompleter]';

const create = (editor: Editor, range: Range): SugarElement =>
  // Check if an existing wrapper exists (eg from undoing), otherwise
  // wrap the content in a span, so we know where to search between
  detect(SugarElement.fromDom(editor.selection.getNode())).getOrThunk(() => {
    // Create a wrapper
    const wrapper = SugarElement.fromHtml('<span data-mce-autocompleter="1" data-mce-bogus="1"></span>', editor.getDoc());

    // Wrap the content
    Insert.append(wrapper, SugarElement.fromDom(range.extractContents()));
    range.insertNode(wrapper.dom);
    Traverse.parent(wrapper).each((elm) => elm.dom.normalize());

    // Update the cursor position
    CursorPosition.last(wrapper).map((last) => {
      editor.selection.setCursorLocation(last.dom, Awareness.getEnd(last));
    });

    return wrapper;
  });

const detect = (elm: SugarElement): Optional<SugarElement> => SelectorFind.closest(elm, autocompleteSelector);

export {
  create,
  detect
};
