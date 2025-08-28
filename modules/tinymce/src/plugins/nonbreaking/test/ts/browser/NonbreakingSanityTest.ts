import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/nonbreaking/Plugin';

describe('browser.tinymce.plugins.nonbreaking.NonbreakingSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'nonbreaking',
    toolbar: 'nonbreaking',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: Click on the nbsp button and assert nonbreaking space is inserted', () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Nonbreaking space"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('span', {
                classes: [ arr.has('mce-nbsp-wrap') ],
                children: [
                  s.text(str.is(Unicode.nbsp))
                ]
              }),
              s.text(str.is(Unicode.zeroWidth))
            ]
          })
        ]
      });
    }));
  });
});
