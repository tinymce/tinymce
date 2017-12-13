import { Step } from '@ephox/agar';
import { TestStore } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';



export default <any> function () {
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
    execCommand: function (name, ui, args) {
      store.adder({ method: 'execCommand', data: Objects.wrap(name, args) })();
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
    adder: store.adder,
    assertEq: store.assertEq,
    sAssertEq: store.sAssertEq,
    sClear: store.sClear,
    sPrepareState: sPrepareState
  };
};