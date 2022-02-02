import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Plugin from 'tinymce/plugins/bbcode/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.bbcode.BbcodeSanityTest', () => {
  const hook = TinyHooks.bddSetupLight({
    plugins: 'bbcode',
    toolbar: 'bbcode',
    base_url: '/project/tinymce/js/tinymce',
    bbcode_dialect: 'punbb'
  }, [ Plugin, Theme ]);

  it('TBA: Set bbcode content and assert the equivalent html structure is present', () => {
    const editor = hook.editor();
    editor.setContent('[b]a[/b]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('strong', {
                children: [
                  s.text(str.is('a'))
                ]
              })
            ]
          })
        ]
      });
    }));
  });
});
