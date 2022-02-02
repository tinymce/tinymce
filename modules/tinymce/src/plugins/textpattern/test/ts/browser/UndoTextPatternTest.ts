import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.textpattern.UndoTextPatternTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'textpattern',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  it('TBA: inline italic then undo', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '*a*');
    TinyAssertions.assertContentStructure(editor, Utils.inlineStructHelper('em', 'a'));
    editor.execCommand('Undo');
    TinyAssertions.assertContent(editor, '<p>*a*&nbsp;</p>');
  });

  it('TBA: block italic then undo', () => {
    const editor = hook.editor();
    Utils.setContentAndPressEnter(editor, '*a*');
    TinyAssertions.assertContentStructure(editor, Utils.inlineBlockStructHelper('em', 'a'));
    editor.execCommand('Undo');
    TinyAssertions.assertContent(editor, '<p>*a*</p>\n<p>&nbsp;</p>');
    editor.execCommand('Undo');
    TinyAssertions.assertContent(editor, '<p>*a*</p>');
  });
});
