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
    const inputs = editor.getBody().getElementsByTagName('input');
    let selected = 0;
    for (let index = 0; index < inputs.length; index++) {
      if (inputs[index].checked) {
        selected++;
      }
    }

    assert.equal(inputs.length, nrOfInputs, 'Should have the right amount of inputs');
    assert.equal(selected, shouldBeSelected, 'Should have exactly one radio button');
  };

  it('TDA: get text format content should trim zwsp', () => {
    const editor = hook.editor();
    editor.setContent('<p>' + Zwsp.ZWSP + 'a</p>');
    const html = editor.getContent({ format: 'text' });
    assert.equal(html, 'a', 'Should be expected html');
  });

  it('TINY-7981: inputs should not be deselected', () => {
    const editor = hook.editor();
    // eslint-disable-next-line max-len
    editor.setContent('<p><label><input name="group-name" type="radio" value="1">Option 1</label><label><input checked="checked" name="group-name" type="radio" value="2">Option 2</label><label><input name="group-name" type="radio" value="3">Option 3</label></p>');
    const html = editor.getContent({ format: 'text' });
    assert.equal(html, 'Option 1Option 2Option 3', 'Should be expected text');
    assertSelectedRadioButtons(editor, 3, 1);
  });
});
