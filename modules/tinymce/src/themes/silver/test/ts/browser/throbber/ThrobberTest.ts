import { ApproxStructure, Assertions, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
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
          'aria-hidden': str.is('true')
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
          'aria-hidden': str.none()
        },
        classes: [ arr.has('tox-throbber') ],
        styles: {
          display: str.none()
        },
        children: [
          s.element('div', {
            attrs: {
              'aria-label': str.is('Loading...')
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

  const setProgressState = (editor: Editor, state: boolean, time?: number) => {
    if (state) {
      editor.setProgressState(true, time);
    } else {
      editor.setProgressState(false);
    }
  };

  it('TINY-3453: Throbber actions test', async () => {
    const editor = hook.editor();
    assertThrobberHiddenStructure();
    setProgressState(editor, true);
    await UiFinder.pWaitForVisible('Wait for throbber to show', SugarBody.body(), '.tox-throbber');
    assertThrobberShownStructure();
    setProgressState(editor, false);
    await UiFinder.pWaitForHidden('Wait for throbber to hide', SugarBody.body(), '.tox-throbber');
    assertThrobberHiddenStructure();
  });

  it('TINY-3453: Throbber actions with timeout test', async () => {
    const editor = hook.editor();
    setProgressState(editor, true, 300);
    // Wait for a little and make sure the throbber is still hidden
    await Waiter.pWait(150);
    assertThrobberHiddenStructure();
    await UiFinder.pWaitForVisible('Wait for throbber to show', SugarBody.body(), '.tox-throbber');
    assertThrobberShownStructure();
    setProgressState(editor, false);
    await UiFinder.pWaitForHidden('Wait for throbber to hide', SugarBody.body(), '.tox-throbber');
    assertThrobberHiddenStructure();
  });
});
