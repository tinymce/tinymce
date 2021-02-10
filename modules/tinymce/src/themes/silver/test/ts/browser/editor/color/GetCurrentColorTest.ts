import { before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import * as ColorSwatch from 'tinymce/themes/silver/ui/core/color/ColorSwatch';

describe('browser.tinymce.themes.silver.editor.color.GetCurrentColorTest', () => {
  before(function () {
    const browser = PlatformDetection.detect().browser;
    if (browser.isIE()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  const assertCurrentColor = (editor: Editor, format: string, label: string, expected: string) => {
    const actual = ColorSwatch.getCurrentColor(editor, format);
    assert.equal(actual, expected, label);
  };

  it('TBA: getCurrentColor should return the first found forecolor, not the parent color', () => {
    const editor = hook.editor();
    editor.setContent('<p style="color: blue;">hello <span style="color: red;">world</span></p>');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 2);
    assertCurrentColor(editor, 'forecolor', 'should return red', 'red');
  });

  it('TBA: getCurrentColor should return the first found backcolor, not the parent color', () => {
    const editor = hook.editor();
    editor.setContent('<p style="background-color: red;">hello <span style="background-color: blue;">world</span></p>');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 2);
    assertCurrentColor(editor, 'backcolor', 'should return blue', 'blue');
  });
});
