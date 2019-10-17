import { Assertions, Chain, GeneralSteps, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body, Css, Element, Location, Scroll, Width } from '@ephox/sugar';

import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('Editor Floating Toolbar Drawer Position test', (success, failure) => {
  Theme();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);
      const uiContainer = Element.fromDom(editor.getContainer());
      const initialContainerPos = Location.absolute(uiContainer);

      const sScrollTo = (x: number, y: number) => Step.sync(() => Scroll.to(x, y));

      const sOpenAndAssertPosition = (top: number, diff: number = 10) => GeneralSteps.sequence([
        Mouse.sClickOn(Body.body(), '.tox-tbtn[title="More..."]'),
        Chain.asStep(Body.body, [
          tinyUi.cWaitForUi('Wait for drawer to be visible', '.tox-toolbar__overflow'),
          Chain.op((toolbar) => {
            const pos = Location.absolute(toolbar);
            const right = pos.left() + Width.get(toolbar);
            Assertions.assertEq(`Drawer top position ${pos.top()}px should be ~${top}px`, true, Math.abs(pos.top() - top) < diff);
            Assertions.assertEq(`Drawer left position ${pos.left()}px should be ~105px`, true, Math.abs(pos.left() - 105) < diff);
            Assertions.assertEq(`Drawer right position ${right}px should be ~465px`, true, Math.abs(right - 465) < diff);
          })
        ]),
        Mouse.sClickOn(Body.body(), '.tox-tbtn[title="More..."]'),
        Waiter.sTryUntil('Wait for drawer to close', UiFinder.sNotExists(Body.body(), '.tox-toolbar__overflow'))
      ]);

      Pipeline.async({ }, [
        Step.sync(() => {
          Css.set(uiContainer, 'margin-left', '100px');
        }),
        sOpenAndAssertPosition(initialContainerPos.top() + 39), // top of ui container + toolbar height
        Step.sync(() => {
          Css.set(uiContainer, 'margin-top', '2000px');
          Css.set(uiContainer, 'margin-bottom', '2000px');
        }),
        sScrollTo(0, 2000),
        sOpenAndAssertPosition(initialContainerPos.top() + 39 + 2000) // top of ui container + toolbar height + scroll pos
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: false,
      width: 400,
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'undo redo | styleselect | bold italic underline | strikethrough superscript subscript | alignleft aligncenter alignright aligncenter | outdent indent | cut copy paste | selectall remove',
      toolbar_drawer: 'floating'
    },
    () => {
      success();
    },
    failure
  );
});
