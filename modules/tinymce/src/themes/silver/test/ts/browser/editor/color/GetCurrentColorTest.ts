import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as ColorSwatch from 'tinymce/themes/silver/ui/core/color/ColorSwatch';

describe('browser.tinymce.themes.silver.editor.color.GetCurrentColorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor',
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const assertCurrentColor = (editor: Editor, format: 'forecolor' | 'hilitecolor', label: string, expected: string) => {
    const actual = ColorSwatch.getCurrentColor(editor, format).getOrDie('No current color found');
    assert.equal(actual, expected, label);
  };

  it('TBA: getCurrentColor should return the first found forecolor, not the parent color', () => {
    const editor = hook.editor();
    editor.setContent('<p style="color: blue;">hello <span style="color: red;">world</span></p>');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 2);
    assertCurrentColor(editor, 'forecolor', 'should return red', '#FF0000');
  });

  it('TBA: getCurrentColor should return the first found backcolor, not the parent color', () => {
    const editor = hook.editor();
    editor.setContent('<p style="background-color: red;">hello <span style="background-color: blue;">world</span></p>');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 2);
    assertCurrentColor(editor, 'hilitecolor', 'should return blue', '#0000FF');
  });
});
