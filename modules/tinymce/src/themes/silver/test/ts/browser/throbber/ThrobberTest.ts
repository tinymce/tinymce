import { ApproxStructure, Assertions, UiFinder, Waiter } from '@ephox/agar';
import { assert, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.throbber.ThrobberTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [ Theme ]);

  const assertThrobberHiddenStructure = () => {
    const throbber = UiFinder.findIn(SugarBody.body(), '.tox-throbber').getOrDie();
    Assertions.assertStructure('Checking disabled structure', ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'aria-hidden': str.is('true'),
          'aria-busy': str.none()
        },
        classes: [ arr.has('tox-throbber') ],
        styles: {
          display: str.is('none')
        }
      })
    ), throbber);
  };

  const assertThrobberShownStructure = () => {
    const throbber = UiFinder.findIn(SugarBody.body(), '.tox-throbber').getOrDie();
    Assertions.assertStructure('Checking enabled structure', ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'aria-hidden': str.none(),
          'aria-busy': str.is('true')
        },
        classes: [ arr.has('tox-throbber') ],
        styles: {
          display: str.none()
        },
        children: [
          s.element('div', {
            attrs: {
              'aria-label': str.is('Loading...'),
              'tabindex': str.is('0'),
            },
            classes: [ arr.has('tox-throbber__busy-spinner') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-spinner') ],
                children: [
                  s.element('div', {}),
                  s.element('div', {}),
                  s.element('div', {})
                ]
              })
            ]
          })
        ]
      })
    ), throbber);
  };

  const assertEditorTabIndex = (editor: Editor, state: boolean) => {
    assert.eq(state ? -1 : 0, editor.iframeElement.tabIndex);
  };

  const pAssertThrobber = async (editor: Editor, state: boolean) => {
    const finder = state ? UiFinder.pWaitForVisible : UiFinder.pWaitForHidden;
    await finder(`Wait for throbber to be ${state ? 'visible' : 'hidden'}`, SugarBody.body(), '.tox-throbber');
    if (state) {
      assertThrobberShownStructure();
    } else {
      assertThrobberHiddenStructure();
    }
    assertEditorTabIndex(editor, state);
  };

  it('TINY-3453: Throbber actions test', async () => {
    const editor = hook.editor();
    await pAssertThrobber(editor, false);
    editor.setProgressState(true);
    await pAssertThrobber(editor, true);
    editor.setProgressState(false);
    await pAssertThrobber(editor, false);
  });

  it('TINY-3453: Throbber actions with timeout test', async () => {
    const editor = hook.editor();
    editor.setProgressState(true, 300);
    // Wait for a little and make sure the throbber is still hidden
    await Waiter.pWait(150);
    assertThrobberHiddenStructure();
    assertEditorTabIndex(editor, false);
    await pAssertThrobber(editor, true);
    editor.setProgressState(false);
    await pAssertThrobber(editor, false);
  });
});
