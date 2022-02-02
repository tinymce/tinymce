import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.EditorApiTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    test_callback: Fun.noop
  }, [ Theme ]);

  const tryAccess = (name: string, expectedValue: any) => {
    const editor = hook.editor();
    const result = editor[name]();
    assert.equal(result, expectedValue, 'Should be expected value on a removed editor');
  };

  it('Try to access/execute things on an editor that does not exists', () => {
    const editor = hook.editor();
    editor.remove();
    tryAccess('getBody', null);
    tryAccess('getDoc', null);
    tryAccess('getWin', null);
    tryAccess('getContent', '');
    tryAccess('getContainer', null);
    tryAccess('getContentAreaContainer', null);
    editor.load();
    editor.save();
    editor.show();
    editor.hide();
    editor.queryCommandState('bold');
    editor.queryCommandValue('bold');
    editor.queryCommandSupported('bold');
    editor.uploadImages(Fun.noop);
    editor.setContent('a');
    editor.execCommand('bold');
    editor.focus();
    editor.nodeChanged();
    editor.execCallback('test_callback', 1);
  });
});
