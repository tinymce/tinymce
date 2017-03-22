define(
  'tinymce.plugins.textpattern.core.KeyHandler',

  [
    'tinymce.plugins.textpattern.core.Formatter'
  ],

  function (Formatter) {
    function handleEnter(editor, patterns) {
      var rng, wrappedTextNode;

      wrappedTextNode = Formatter.applyInlineFormat(editor, patterns, false);
      if (wrappedTextNode) {
        rng = editor.dom.createRng();
        rng.setStart(wrappedTextNode, wrappedTextNode.data.length);
        rng.setEnd(wrappedTextNode, wrappedTextNode.data.length);
        editor.selection.setRng(rng);
      }

      Formatter.applyBlockFormat(editor, patterns);
    }

    function handleSpace(editor, patterns) {
      var wrappedTextNode, lastChar, lastCharNode, rng, dom;

      wrappedTextNode = Formatter.applyInlineFormat(editor, patterns, true);
      if (wrappedTextNode) {
        dom = editor.dom;
        lastChar = wrappedTextNode.data.slice(-1);

        // Move space after the newly formatted node
        if (/[\u00a0 ]/.test(lastChar)) {
          wrappedTextNode.deleteData(wrappedTextNode.data.length - 1, 1);
          lastCharNode = dom.doc.createTextNode(lastChar);

          if (wrappedTextNode.nextSibling) {
            dom.insertAfter(lastCharNode, wrappedTextNode.nextSibling);
          } else {
            wrappedTextNode.parentNode.appendChild(lastCharNode);
          }

          rng = dom.createRng();
          rng.setStart(lastCharNode, 1);
          rng.setEnd(lastCharNode, 1);
          editor.selection.setRng(rng);
        }
      }
    }

    return {
      handleEnter: handleEnter,
      handleSpace: handleSpace
    };
  }
);
