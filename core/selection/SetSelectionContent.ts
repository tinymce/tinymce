/**
 * SetSelectionContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const setContent = function (editor, content, args) {
  let rng = editor.selection.getRng(), caretNode;
  const doc = editor.getDoc();
  let frag, temp;

  args = args || { format: 'html' };
  args.set = true;
  args.selection = true;
  args.content = content;

  // Dispatch before set content event
  if (!args.no_events) {
    args = editor.fire('BeforeSetContent', args);
    if (args.isDefaultPrevented()) {
      editor.fire('SetContent', args);
      return;
    }
  }

  content = args.content;

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

    // Make sure we wrap it compleatly, Opera fails with a simple select call
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
    if (rng.item) {
      // Delete content and get caret text selection
      doc.execCommand('Delete', false, null);
      rng = editor.getRng();
    }

    // Explorer removes spaces from the beginning of pasted contents
    if (/^\s+/.test(content)) {
      rng.pasteHTML('<span id="__mce_tmp">_</span>' + content);
      editor.dom.remove('__mce_tmp');
    } else {
      rng.pasteHTML(content);
    }
  }

  // Dispatch set content event
  if (!args.no_events) {
    editor.fire('SetContent', args);
  }
};

export default {
  setContent
};