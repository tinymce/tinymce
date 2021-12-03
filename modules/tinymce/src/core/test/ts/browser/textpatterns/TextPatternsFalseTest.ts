import { ApproxStructure } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import * as Utils from '../../module/test/TextPatternsUtils';

describe('browser.tinymce.core.textpattern.TextPatternsFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    text_patterns: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ ListsPlugin ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  it('Try applying italic format on single word using space and assert it does nothing', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '*a *', 4);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return Utils.bodyStruct([
        s.element('p', {
          children: [
            s.text(str.is(`*a *${Unicode.nbsp}`), true)
          ]
        })
      ]);
    }));
  });

});
