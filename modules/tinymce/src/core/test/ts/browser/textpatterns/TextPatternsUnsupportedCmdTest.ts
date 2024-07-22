import { ApproxStructure } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as Utils from '../../module/test/TextPatternsUtils';

describe('browser.tinymce.core.textpatterns.TextPatternsUnsupportedCmdTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    text_patterns: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [ ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  it('TINY-10994: Try applying list pattern from premium plugin and assert it does nothing', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '1.');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return Utils.bodyStruct([
        s.element('p', {
          children: [
            s.text(str.is(`1.${Unicode.nbsp}`), true)
          ]
        })
      ]);
    }));
  });
});
