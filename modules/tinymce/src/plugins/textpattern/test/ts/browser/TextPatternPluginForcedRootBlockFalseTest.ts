import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import TextPatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.textpattern.TextPatternPluginForcedRootBlockFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'textpattern lists',
    base_url: '/project/tinymce/js/tinymce',
    forced_root_block: false
  }, [ ListsPlugin, TextPatternPlugin, Theme ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  it('inline format with forced_root_block: false', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '**a**', 5, [ 0 ], false);
    TinyAssertions.assertContentStructure(editor, Utils.forcedRootBlockInlineStructHelper('strong', 'a'));
  });

  it('block format with forced_root_block: false', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '# heading 1', 11, [ 0 ], false);
    TinyAssertions.assertContentStructure(editor, Utils.forcedRootBlockStructHelper('h1', ' heading 1'));
  });
});
