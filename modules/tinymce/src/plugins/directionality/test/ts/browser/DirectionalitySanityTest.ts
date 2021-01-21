import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/directionality/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.directionality.DirectionalitySanityTest', () => {
  const hook = TinyHooks.bddSetupLight({
    plugins: 'directionality',
    toolbar: 'ltr rtl',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  it('TBA: Set and select content, click on the Right to left toolbar button and assert direction is right to left', () => {
    const editor = hook.editor();
    editor.setContent('a');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            attrs: {
              dir: str.is('rtl')
            }
          })
        ]
      });
    }));
  });

  it('TBA: Set and select content, click on the Left to right toolbar button and assert direction is left to right', () => {
    const editor = hook.editor();
    editor.setContent('<p dir="rtl">a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            attrs: {
              dir: str.is('ltr')
            }
          })
        ]
      });
    }));
  });
});
