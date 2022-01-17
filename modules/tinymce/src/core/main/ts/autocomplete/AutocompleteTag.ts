/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { Awareness, CursorPosition, Insert, Remove, SelectorFind, SugarElement, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';

const autocompleteSelector = '[data-mce-autocompleter]';

const create = (editor: Editor, range: Range): void => {
  // Check if an existing wrapper exists (eg from undoing), otherwise
  // wrap the content in a span, so we know where to search between
  if (findIn(SugarElement.fromDom(editor.getBody())).isNone()) {
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
  }
};

const detect = (elm: SugarElement<Node>): Optional<SugarElement<Element>> => SelectorFind.closest(elm, autocompleteSelector);

const findIn = (elm: SugarElement<Element>): Optional<SugarElement> => SelectorFind.descendant(elm, autocompleteSelector);

const remove = (elm: SugarElement<Element>): void => findIn(elm).each(Remove.unwrap);

export {
  create,
  detect,
  findIn,
  remove
};
