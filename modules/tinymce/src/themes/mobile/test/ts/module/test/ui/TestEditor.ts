import { Step } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Cell, Fun } from '@ephox/katamari';

export default () => {
  const store = TestHelpers.TestStore();

  const editorState = {
    start: Cell(null),
    content: Cell('')
  };

  const sPrepareState = (node, content) => {
    return Step.sync(() => {
      editorState.start.set(node);
      editorState.content.set(content);
    });
  };

  const editor = {
    selection: {
      getStart: editorState.start.get,
      getContent: editorState.content.get,
      select: Fun.noop
    },

    insertContent: (data) => {
      store.adder({ method: 'insertContent', data })();
    },
    execCommand: (name, ui, args) => {
      store.adder({ method: 'execCommand', data: Objects.wrap(name, args) })();
    },
    dom: {
      createHTML: (tag, attributes, innerText) => {
        return { tag, attributes, innerText };
      },
      encode: Fun.identity
    },
    focus: Fun.noop,
    ui: {
      registry: {
        getAll: () => ({
          icons: {}
        })
      }
    }
  };

  return {
    editor: Fun.constant(editor),
    adder: store.adder,
    assertEq: store.assertEq,
    sAssertEq: store.sAssertEq,
    sClear: store.sClear,
    sPrepareState
  };
};
