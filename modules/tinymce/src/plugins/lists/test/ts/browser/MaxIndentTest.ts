import { UiFinder } from '@ephox/agar';
import { afterEach, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

const olZeroIndentList = '<ol><li>a</li></ol>';
const olOneIndentList = '<ol><li style="list-style-type: none;"><ol><li>a</li></ol></li></ol>';
const olTwoIndentList = '<ol><li style="list-style-type: none;"><ol><li style="list-style-type: none;"><ol><li>a</li></ol></li></ol></li></ol>';
const olThreeIndentList = '<ol><li style="list-style-type: none;"><ol><li style="list-style-type: none;"><ol><li style="list-style-type: none;"><ol><li>a</li></ol></li></ol></li></ol></li></ol>';

describe('browser.tinymce.plugins.lists.MaxIndentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    list_max_depth: 2,
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'indent outdent',
    indent: false,
  }, [ Plugin ], true);

  afterEach(() => {
    hook.editor().options.unset('list_max_depth');
  });

  const indentIsDisabled = () =>
    UiFinder.exists(SugarBody.body(), '[aria-label="Increase indent"][aria-disabled="true"]');

  const indentIsEnabled = () =>
    UiFinder.exists(SugarBody.body(), '[aria-label="Increase indent"]:not([aria-disabled="true"])');

  context('With a depth of two', () => {
    beforeEach(() => {
      hook.editor().options.set('list_max_depth', 2);
    });

    it('TINY-11937: Indent single LI until hitting the max depth', () => {
      const editor = hook.editor();
      editor.setContent(olZeroIndentList);

      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      editor.execCommand('Indent');
      indentIsEnabled();
      TinyAssertions.assertContent( editor, olOneIndentList);
      editor.execCommand('Indent');
      indentIsDisabled();
      TinyAssertions.assertContent( editor, olTwoIndentList );
      editor.execCommand('Indent');
      indentIsDisabled();
      TinyAssertions.assertContent( editor, olTwoIndentList );
    });

    it('TINY-11937: Cannot indent on something past the limit, but can outdent', () => {
      const editor = hook.editor();
      editor.setContent(olThreeIndentList);

      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], 0);
      indentIsDisabled();
      editor.execCommand('Indent');
      TinyAssertions.assertContent( editor, olThreeIndentList);
      editor.execCommand('Outdent');
      indentIsDisabled();
      TinyAssertions.assertContent( editor, olTwoIndentList );
      editor.execCommand('Indent');
      indentIsDisabled();
      TinyAssertions.assertContent( editor, olTwoIndentList );
      editor.execCommand('Outdent');
      indentIsEnabled();
      TinyAssertions.assertContent( editor, olOneIndentList );
      editor.execCommand('Indent');
      indentIsDisabled();
      TinyAssertions.assertContent( editor, olTwoIndentList );
    });

    it('TINY-11937: Can indent wider selections until all are at max level.', () => {
      const editor = hook.editor();
      editor.setContent('<ol><li>C</li><li style="list-style-type: none;"><ol><li>B</li><li style="list-style-type: none;"><ol><li>a</li></ol></li></ol></li></ol>');

      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 1, 0, 0 ], 1);
      indentIsEnabled();
      editor.execCommand('Indent');
      TinyAssertions.assertContent( editor, '<ol><li style="list-style-type: none;"><ol><li>C<ol><li>B</li><li>a</li></ol></li></ol></li></ol>');
      indentIsEnabled();
      editor.execCommand('Indent');
      TinyAssertions.assertContent( editor, '<ol><li style="list-style-type: none;"><ol><li style="list-style-type: none;"><ol><li>C</li><li>B</li><li>a</li></ol></li></ol></li></ol>');
    });
  });

  context('With a depth of zero', () => {
    beforeEach(() => {
      hook.editor().options.set('list_max_depth', 0);
    });

    it('TINY-11937: Indent single LI until hitting the max depth', () => {
      const editor = hook.editor();
      editor.setContent(olZeroIndentList);

      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      indentIsDisabled();
      editor.execCommand('Indent');
      indentIsDisabled();
      TinyAssertions.assertContent( editor, olZeroIndentList);
    });

    it('TINY-11937: Indent works as expected for paragraphs still', () => {
      const editor = hook.editor();
      editor.setContent('<p>A</p>');

      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      indentIsEnabled();
      editor.execCommand('Indent');
      indentIsEnabled();
      TinyAssertions.assertContent( editor, '<p style="padding-left: 40px;">A</p>');
      editor.execCommand('Indent');
      indentIsEnabled();
      TinyAssertions.assertContent( editor, '<p style="padding-left: 80px;">A</p>');
    });
  });
});
