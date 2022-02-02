import { Assertions, Cursors, Step, Waiter } from '@ephox/agar';
import { GuiFactory } from '@ephox/alloy';
import { Fun, Optional } from '@ephox/katamari';
import { Attribute, Focus, SugarElement, WindowSelection } from '@ephox/sugar';

import TestEditor from './TestEditor';

export default () => {
  const frame = SugarElement.fromTag('iframe');
  Attribute.set(frame, 'src', '/project/tinymce/src/themes/mobile/test/html/editor.html');

  const sWaitForEditorLoaded = Waiter.sTryUntil(
    'Waiting for iframe to load',
    Step.sync(() => {
      Assertions.assertEq('Check for a content editable body', 'true', frame.dom.contentWindow.document.body.contentEditable);
    }),
    100,
    8000
  );

  const config = {
    getFrame: Fun.constant(frame),
    onDomChanged: () => {
      return { unbind: Fun.noop };
    }
  };

  const delegate = TestEditor();
  const dEditor = delegate.editor();

  const editor = {
    selection: {
      getStart: () => {
        return WindowSelection.getExact(frame.dom.contentWindow).map((sel) => {
          return sel.start.dom;
        }).getOr(null);
      },
      getContent: () => {
        return frame.dom.contentWindow.document.body.innerHTML;
      },
      select: Fun.noop
    },

    getBody: () => {
      return frame.dom.contentWindow.document.body;
    },

    insertContent: dEditor.insertContent,
    execCommand: dEditor.execCommand,
    dom: dEditor.dom,
    // Maybe this should be implemented
    focus: () => {
      Focus.focus(frame);
      const win = frame.dom.contentWindow;
      WindowSelection.getExact(win).orThunk(() => {
        const fbody = SugarElement.fromDom(frame.dom.contentWindow.document.body);
        const elem = Cursors.calculateOne(fbody, [ 0 ]);
        WindowSelection.setExact(win, elem, 0, elem, 0);
        return Optional.none();
      });
    },
    ui: {
      registry: {
        getAll: () => ({
          icons: {}
        })
      }
    }
  };

  const component = GuiFactory.build(
    GuiFactory.external({
      element: frame
    })
  );

  return {
    component: Fun.constant(component),
    config: Fun.constant(config),
    editor: Fun.constant(editor),
    adder: delegate.adder,
    assertEq: delegate.assertEq,
    sAssertEq: delegate.sAssertEq,
    sWaitForEditorLoaded,
    sClear: delegate.sClear,
    sPrepareState: delegate.sPrepareState
  };
};
