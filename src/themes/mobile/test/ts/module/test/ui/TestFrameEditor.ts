import { Cursors, Waiter, Step, Assertions } from '@ephox/agar';
import { GuiFactory, ComponentApi } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';
import { Attr, Element, Focus, WindowSelection } from '@ephox/sugar';

import TestEditor from './TestEditor';

export default function () {
  const frame = Element.fromTag('iframe');
  Attr.set(frame, 'src', '/project/src/themes/mobile/test/html/editor.html');

  const sWaitForEditorLoaded = Waiter.sTryUntil(
    'Waiting for iframe to load',
    Step.sync(() => {
      Assertions.assertEq('Check for a content editable body', 'true', frame.dom().contentWindow.document.body.contentEditable);
    }),
    100,
    8000
  );

  const config = {
    getFrame () {
      return frame;
    },
    onDomChanged () {
      return { unbind: Fun.noop };
    }
  };

  const delegate = TestEditor();
  const dEditor = delegate.editor();

  const editor = {
    selection: {
      getStart () {
        return WindowSelection.getExact(frame.dom().contentWindow).map(function (sel) {
          return sel.start().dom();
        }).getOr(null);
      },
      getContent () {
        return frame.dom().contentWindow.document.body.innerHTML;
      },
      select: Fun.noop
    },

    getBody () {
      return frame.dom().contentWindow.document.body;
    },

    insertContent: dEditor.insertContent,
    execCommand: dEditor.execCommand,
    dom: dEditor.dom,
    // Maybe this should be implemented
    focus () {
      Focus.focus(frame);
      const win = frame.dom().contentWindow;
      WindowSelection.getExact(win).orThunk(function () {
        const fbody = Element.fromDom(frame.dom().contentWindow.document.body);
        const elem = Cursors.calculateOne(fbody, [ 0 ]);
        WindowSelection.setExact(win, elem, 0, elem, 0);
      });
    }
  };

  const component = GuiFactory.build(
    GuiFactory.external({
      element: frame
    })
  );

  return {
    component: Fun.constant(component) as () => ComponentApi.AlloyComponent,
    config: Fun.constant(config),
    editor: Fun.constant(editor),
    adder: delegate.adder,
    assertEq: delegate.assertEq,
    sAssertEq: delegate.sAssertEq,
    sWaitForEditorLoaded,
    sClear: delegate.sClear,
    sPrepareState: delegate.sPrepareState
  };
}