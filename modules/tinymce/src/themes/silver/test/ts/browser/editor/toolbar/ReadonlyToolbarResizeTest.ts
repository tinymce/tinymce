import { ApproxStructure, Assertions, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { ToolbarMode } from 'tinymce/themes/silver/api/Settings';
import Theme from 'tinymce/themes/silver/Theme';

import { pOpenMore } from '../../../module/MenuUtils';
import { resizeToPos } from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.toolbar.ReadonlyToolbarResizeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold | italic | underline | strikethrough | cut | copy | paste | indent | subscript | superscript | removeformat',
    toolbar_mode: 'floating',
    menubar: false,
    width: 300,
    height: 400,
    readonly: true,
    resize: 'both'
  }, [ Theme ]);

  const resizeTo = (sx: number, sy: number, dx: number, dy: number) => {
    const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();
    Mouse.mouseDown(resizeHandle);
    resizeToPos(sx, sy, dx, dy);
  };

  const pAssertToolbarButtonState = (label: string, disabled: boolean, f: ApproxStructure.Builder<StructAssert[]>) =>
    Waiter.pTryUntil('Waiting for toolbar state', () => {
      const overlord = UiFinder.findIn(SugarBody.body(), '.tox-toolbar-overlord').getOrDie();
      Assertions.assertStructure(label, ApproxStructure.build((s, str, arr) =>
        s.element('div', {
          classes: [
            arr.has('tox-toolbar-overlord'),
            disabled ? arr.has('tox-tbtn--disabled') : arr.not('tox-tbtn--disabled')
          ],
          attrs: { 'aria-disabled': str.is(disabled + '') },
          children: [
            s.element('div', {
              classes: [ arr.has('tox-toolbar__primary') ],
              children: f(s, str, arr)
            })
          ]
        })
      ), overlord);
    });

  const pAssertToolbarDrawerButtonState = (label: string, f: (s, str, arr) => StructAssert[]) =>
    Waiter.pTryUntil('Waiting for toolbar state', () => {
      const overflow = UiFinder.findIn(SugarBody.body(), '.tox-toolbar__overflow').getOrDie();
      Assertions.assertStructure(label, ApproxStructure.build((s, str, arr) =>
        s.element('div', {
          classes: [
            arr.has('tox-toolbar__overflow')
          ],
          children: f(s, str, arr)
        })
      ), overflow);
    });

  const disabledButtonStruct = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi, buttonName: string) => s.element('div', {
    classes: [ arr.has('tox-toolbar__group') ],
    children: [
      s.element('button', {
        classes: [ arr.has('tox-tbtn'), arr.has('tox-tbtn--disabled') ],
        attrs: {
          'title': str.is(buttonName),
          'aria-disabled': str.is('true')
        }
      })
    ]
  });

  const enabledButtonStruct = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi, buttonName: string) => s.element('div', {
    classes: [ arr.has('tox-toolbar__group') ],
    children: [
      s.element('button', {
        classes: [ arr.has('tox-tbtn'), arr.not('tox-tbtn--disabled') ],
        attrs: {
          'title': str.is(buttonName),
          'aria-disabled': str.is('false')
        }
      })
    ]
  });

  it('TBA: Test if the toolbar buttons are disabled in readonly mode when toolbar drawer is present', async () => {
    await pAssertToolbarButtonState('Assert the first toolbar button, Bold is disabled', true, (s, str, arr) => [
      disabledButtonStruct(s, str, arr, 'Bold'),
      s.theRest()
    ]);

    resizeTo(300, 400, 400, 400);

    await pAssertToolbarButtonState('Assert the toolbar buttons are disabled after resizing the editor', true, (s, str, arr) => [
      disabledButtonStruct(s, str, arr, 'Bold'),
      disabledButtonStruct(s, str, arr, 'Italic'),
      disabledButtonStruct(s, str, arr, 'Underline'),
      disabledButtonStruct(s, str, arr, 'Strikethrough'),
      disabledButtonStruct(s, str, arr, 'Cut'),
      disabledButtonStruct(s, str, arr, 'Copy'),
      disabledButtonStruct(s, str, arr, 'Paste'),
      disabledButtonStruct(s, str, arr, 'Increase indent'),
      s.theRest()
    ]);
  });

  it('TINY-6014: Test buttons become enabled again when disabling readonly mode and resizing', async () => {
    const editor = hook.editor();
    await pAssertToolbarButtonState('Assert the first toolbar button, Bold is disabled', true, (s, str, arr) => [
      disabledButtonStruct(s, str, arr, 'Bold'),
      s.theRest()
    ]);
    editor.mode.set('design');
    await pOpenMore(ToolbarMode.floating);
    await pAssertToolbarButtonState('Assert the toolbar buttons are enabled', false, (s, str, arr) => [
      enabledButtonStruct(s, str, arr, 'Bold'),
      enabledButtonStruct(s, str, arr, 'Italic'),
      enabledButtonStruct(s, str, arr, 'Underline'),
      enabledButtonStruct(s, str, arr, 'Strikethrough'),
      enabledButtonStruct(s, str, arr, 'Cut'),
      enabledButtonStruct(s, str, arr, 'Copy'),
      enabledButtonStruct(s, str, arr, 'Paste'),
      enabledButtonStruct(s, str, arr, 'Increase indent'),
      s.theRest()
    ]);
    await pAssertToolbarDrawerButtonState('Assert the toolbar drawer buttons are enabled', (s, str, arr) => [
      enabledButtonStruct(s, str, arr, 'Subscript'),
      enabledButtonStruct(s, str, arr, 'Superscript'),
      enabledButtonStruct(s, str, arr, 'Clear formatting')
    ]);

    resizeTo(400, 400, 450, 400);

    await pAssertToolbarButtonState('Assert the toolbar buttons are enabled and now include subscript', false, (s, str, arr) => [
      enabledButtonStruct(s, str, arr, 'Bold'),
      enabledButtonStruct(s, str, arr, 'Italic'),
      enabledButtonStruct(s, str, arr, 'Underline'),
      enabledButtonStruct(s, str, arr, 'Strikethrough'),
      enabledButtonStruct(s, str, arr, 'Cut'),
      enabledButtonStruct(s, str, arr, 'Copy'),
      enabledButtonStruct(s, str, arr, 'Paste'),
      enabledButtonStruct(s, str, arr, 'Increase indent'),
      enabledButtonStruct(s, str, arr, 'Subscript'),
      s.theRest()
    ]);
    await pAssertToolbarDrawerButtonState('Assert the toolbar drawer buttons are enabled', (s, str, arr) => [
      enabledButtonStruct(s, str, arr, 'Superscript'),
      enabledButtonStruct(s, str, arr, 'Clear formatting')
    ]);
  });
});
