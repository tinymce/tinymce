import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/visualblocks/Plugin';

describe('browser.tinymce.plugins.visualblocks.VisualBlocksSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'visualblocks',
    toolbar: 'visualblocks',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: Assert visual blocks are not present, click on the visual blocks button and assert they are present, click on the button again and assert they are not present', () => {
    const editor = hook.editor();
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, _str, arr) => {
      return s.element('body', {
        classes: [
          arr.not('mce-visualblocks')
        ]
      });
    }));
    TinyUiActions.clickOnToolbar(editor, 'button');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, _str, arr) => {
      return s.element('body', {
        classes: [
          arr.has('mce-visualblocks')
        ]
      });
    }));
    TinyUiActions.clickOnToolbar(editor, 'button');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, _str, arr) => {
      return s.element('body', {
        classes: [
          arr.not('mce-visualblocks')
        ]
      });
    }));
  });
});
