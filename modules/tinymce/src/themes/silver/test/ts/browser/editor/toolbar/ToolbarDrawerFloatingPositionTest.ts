import { Assertions, Chain, GeneralSteps, Mouse, Pipeline, Step, UiFinder, Waiter, Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyUi, Editor as McEditor } from '@ephox/mcagar';
import { Body, Css, Element, Location, Scroll, Width, SelectorFind } from '@ephox/sugar';

import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';
import { window } from '@ephox/dom-globals';

UnitTest.asynctest('Editor Floating Toolbar Drawer Position test', (success, failure) => {
  Theme();

  const editorSettings = {
    theme: 'silver',
    menubar: false,
    width: 400,
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'undo redo | styleselect | bold italic underline | strikethrough superscript subscript | alignleft aligncenter alignright aligncenter | outdent indent | cut copy paste | selectall remove',
    toolbar_drawer: 'floating'
  };

  const sScrollTo = (x: number, y: number) => Step.sync(() => Scroll.to(x, y));

  Pipeline.async({}, [
    Logger.t('Editor Floating Toolbar Drawer Position test', Chain.asStep({}, [
      McEditor.cFromSettings(editorSettings),
      Chain.async((editor: Editor, onSuccess, onFailure) => {
        const tinyUi = TinyUi(editor);
        const uiContainer = Element.fromDom(editor.getContainer());
        const initialContainerPos = Location.absolute(uiContainer);

        const sOpenAndAssertPosition = (top: number) => GeneralSteps.sequence([
          Mouse.sClickOn(Body.body(), '.tox-tbtn[title="More..."]'),
          Chain.asStep(Body.body, [
            tinyUi.cWaitForUi('Wait for drawer to be visible', '.tox-toolbar__overflow'),
            Chain.op((toolbar) => {
              const diff = 10;
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
          sOpenAndAssertPosition(initialContainerPos.top() + 39 + 2000), // top of ui container + toolbar height + scroll pos
        ], () => onSuccess(editor), onFailure);
      }),
      McEditor.cRemove
    ])),

    Logger.t('Editor Floating Toolbar Drawer Position test with toolbar bottom & toolbar sticky', Chain.asStep({}, [
      McEditor.cFromSettings({
        ...editorSettings,
        toolbar_location: 'bottom',
        toolbar_sticky: true
      }),
      Chain.async((editor: Editor, onSuccess, onFailure) => {
        const uiContainer = Element.fromDom(editor.getContainer());

        const cAssertFloatingToolbarPosition = (assertPosition: 'above' | 'below') => {
          return Step.sync(() => {
            const floatingToolbar = SelectorFind.descendant(Body.body(), '.tox-toolbar__overflow').getOrDie();
            const primaryToolbar = SelectorFind.descendant(Body.body(), '.tox-toolbar__primary').getOrDie();

            const isAbove = floatingToolbar.dom().getBoundingClientRect().top < primaryToolbar.dom().getBoundingClientRect().top;

            if (assertPosition === 'above') {
              Assertions.assertEq('Floating toolbar should be above primary toolbar', true, isAbove);
            } else {
              Assertions.assertEq('Floating toolbar should be below primary toolbar', false, isAbove);
            }
          });
        };

        Pipeline.async({ }, [
          Step.sync(() => {
            Css.set(uiContainer, 'margin-top', '3000px');
            Css.set(uiContainer, 'margin-bottom', '100px');
          }),
          sScrollTo(0, 3000),
          Mouse.sClickOn(Body.body(), '.tox-tbtn[title="More..."]'),
          Waiter.sTryUntil(
            'Waiting until floating toolbar is below primary toolbar',
            cAssertFloatingToolbarPosition('below'),
          ),
          sScrollTo(0, Body.body().dom().scrollHeight - window.innerHeight + 150),
          Waiter.sTryUntil(
            'Waiting until floating toolbar is above primary toolbar',
            cAssertFloatingToolbarPosition('above'),
          )
        ], () => onSuccess(editor), onFailure);
      }),
      McEditor.cRemove
    ])),
  ], () => success(), failure);
});
