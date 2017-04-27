define(
  'tinymce.themes.mobile.test.ui.TestEditor',

  [
    'ephox.agar.api.Step',
    'ephox.alloy.test.TestStore',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun'
  ],

  function (Step, TestStore, Cell, Fun) {
    var store = TestStore();

    var editorState = {
      start: Cell(null),
      content: Cell('')
    };

    var sPrepareState = function (node, content) {
      return Step.sync(function () {
        editorState.start.set(node);
        editorState.content.set(content);
      });
    };

    var editor = {
      selection: {
        getStart: editorState.start.get,
        getContent: editorState.content.get,
        select: Fun.noop
      },
      insertContent: function (data) {
        store.adder({ method: 'insertContent', data: data })();
      },
      dom: {
        createHTML: function (tag, attributes, innerText) {
          return { tag: tag, attributes: attributes, innerText: innerText };
        },
        encode: Fun.identity
      },
      focus: Fun.noop
    };

    return {
      editor: Fun.constant(editor),
      assertEq: store.assertEq,
      sAssertEq: store.sAssertEq,
      sPrepareState: sPrepareState
    };
  }
);
