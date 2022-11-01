import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.content.EditorGetContentTextFormatTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const assertSelectedRadioButtons = (editor: Editor, nrOfInputs: number, shouldBeSelected: number) => {
    const total = editor.getBody().querySelectorAll('input').length;
    const selected = editor.getBody().querySelectorAll('input:checked').length;

    assert.equal(total, nrOfInputs, 'Should have the right amount of inputs');
    assert.equal(selected, shouldBeSelected, 'Should have exactly one radio button');
  };

  it('TBA: get text format content should trim zwsp', () => {
    const editor = hook.editor();
    editor.setContent('<p>' + Zwsp.ZWSP + 'a</p>');
    const html = editor.getContent({ format: 'text' });
    assert.equal(html, 'a', 'Should be expected html');
  });

  it('TINY-7981: inputs should not be deselected', () => {
    const editor = hook.editor();
    editor.setContent('<p><input name="group-name" type="radio">Option 1<input checked="checked" name="group-name" type="radio">Option 2<input name="group-name" type="radio">Option 3</p>');
    const html = editor.getContent({ format: 'text' });
    assert.equal(html, 'Option 1Option 2Option 3', 'Should be expected text');
    assertSelectedRadioButtons(editor, 3, 1);
  });
});
