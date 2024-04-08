import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.EditorRemovedApiTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    test_callback: Fun.noop
  }, []);

  const tryAccess = (name: keyof Editor, expectedValue: any) => {
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
    editor.uploadImages();
    editor.setContent('a');
    editor.insertContent('a');
    editor.execCommand('bold');
    editor.focus();
    editor.nodeChanged();
  });
});
