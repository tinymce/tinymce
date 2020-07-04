/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { EditorEvent } from '../api/dom/EventUtils';
import { Editor } from '../api/Editor';
import Serializer from '../api/html/Serializer';
import { SetContentArgs } from '../content/SetContent';

export interface SelectionSetContentArgs extends SetContentArgs {
  selection?: boolean;
}

const setupArgs = (args: Partial<SelectionSetContentArgs>, content: string): SelectionSetContentArgs => ({
  format: 'html',
  ...args,
  set: true,
  selection: true,
  content
});

const cleanContent = (editor: Editor, args: SelectionSetContentArgs) => {
  if (args.format !== 'raw') {
    const node = editor.parser.parse(args.content, { isRootContent: true, forced_root_block: false, ...args });
    return Serializer({ validate: editor.validate }, editor.schema).serialize(node);
  } else {
    return args.content;
  }
};

const setContent = (editor: Editor, content: string, args: SelectionSetContentArgs) => {
  // Note: Need to cast as an EditorEvent due to reusing the variable for the editor.fire() return value
  let contentArgs = setupArgs(args, content) as EditorEvent<SelectionSetContentArgs>;

  let rng = editor.selection.getRng(), caretNode;
  const doc = editor.getDoc();
  let frag, temp;

  // Dispatch before set content event
  if (!contentArgs.no_events) {
    contentArgs = editor.fire('BeforeSetContent', contentArgs);
    if (contentArgs.isDefaultPrevented()) {
      editor.fire('SetContent', contentArgs);
      return;
    }
  }

  // Sanitize the content
  content = cleanContent(editor, contentArgs);

  if (rng.insertNode) {
    // Make caret marker since insertNode places the caret in the beginning of text after insert
    content += '<span id="__caret">_</span>';

    // Delete and insert new node
    if (rng.startContainer === doc && rng.endContainer === doc) {
      // WebKit will fail if the body is empty since the range is then invalid and it can't insert contents
      doc.body.innerHTML = content;
    } else {
      rng.deleteContents();

      if (doc.body.childNodes.length === 0) {
        doc.body.innerHTML = content;
      } else {
        // createContextualFragment doesn't exists in IE 9 DOMRanges
        if (rng.createContextualFragment) {
          rng.insertNode(rng.createContextualFragment(content));
        } else {
          // Fake createContextualFragment call in IE 9
          frag = doc.createDocumentFragment();
          temp = doc.createElement('div');

          frag.appendChild(temp);
          temp.outerHTML = content;

          rng.insertNode(frag);
        }
      }
    }

    // Move to caret marker
    caretNode = editor.dom.get('__caret');

    // Make sure we wrap it completely, Opera fails with a simple select call
    rng = doc.createRange();
    rng.setStartBefore(caretNode);
    rng.setEndBefore(caretNode);
    editor.selection.setRng(rng);

    // Remove the caret position
    editor.dom.remove('__caret');

    try {
      editor.selection.setRng(rng);
    } catch (ex) {
      // Might fail on Opera for some odd reason
    }
  } else {
    let anyRng: any = rng;
    if (anyRng.item) {
      // Delete content and get caret text selection
      doc.execCommand('Delete', false, null);
      anyRng = editor.selection.getRng();
    }

    // Explorer removes spaces from the beginning of pasted contents
    if (/^\s+/.test(content)) {
      anyRng.pasteHTML('<span id="__mce_tmp">_</span>' + content);
      editor.dom.remove('__mce_tmp');
    } else {
      anyRng.pasteHTML(content);
    }
  }

  // Dispatch set content event
  if (!contentArgs.no_events) {
    editor.fire('SetContent', contentArgs);
  }
};

export default {
  setContent
};