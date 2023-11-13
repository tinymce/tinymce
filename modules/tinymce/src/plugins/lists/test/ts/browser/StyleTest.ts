import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as InsertNewLine from 'tinymce/core/newline/InsertNewLine';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.StyleTest', () => {
  Arr.each([
    { plugins: '', setupModules: [] },
    { plugins: 'lists', setupModules: [ Plugin ] },
  ], ({ plugins, setupModules }) => {
    const hook = TinyHooks.bddSetup<Editor>({
      plugins,
      toolbar: false,
      indent: false,
      base_url: '/project/tinymce/js/tinymce'
    }, setupModules);

    it('TINY-10316: Create a new `li` from a nested list should preserve the style', () => {
      const editor = hook.editor();
      editor.setContent(`<ol>
        <li style="color: black; list-style-type: square;">1</li>
        <li style="color: green; list-style-type: disc;">parent
          <ol>
            <li style="color: red;"><span style="color: blue;">nested</span></li>
          </ol>
        </li>
      </ol>`);
      TinySelections.setCursor(editor, [ 0, 1, 1, 0, 0, 0 ], 'nested'.length);
      InsertNewLine.insert(editor);
      InsertNewLine.insert(editor);
      editor.insertContent('abc');
      TinyAssertions.assertContent(editor, '<ol>' +
        '<li style="color: black; list-style-type: square;">1</li>' +
        '<li style="color: green; list-style-type: disc;">parent' +
          '<ol>' +
            '<li style="color: red;"><span style="color: blue;">nested</span></li>' +
          '</ol>' +
        '</li>' +
        '<li style="color: red;"><span style="color: blue;">abc</span></li>' +
      '</ol>');
    });

    it('TINY-10316: Create a new `li` from a nested list with multiple `li`s should preserve the style', () => {
      const editor = hook.editor();
      editor.setContent(`<ol>
        <li style="color: black; list-style-type: square;">1</li>
        <li style="color: green; list-style-type: disc;">parent
          <ol>
            <li style="color: red;"><span style="color: blue;">nested 1</span></li>
            <li style="color: yellow;"><span style="color: purple;">nested mid</span></li>
            <li style="color: red;"><span style="color: blue;">nested 2</span></li>
          </ol>
        </li>
      </ol>`);
      TinySelections.setCursor(editor, [ 0, 1, 1, 1, 0, 0 ], 'nested mid'.length);
      InsertNewLine.insert(editor);
      InsertNewLine.insert(editor);
      editor.insertContent('abc');
      TinyAssertions.assertContent(editor, '<ol>' +
        '<li style="color: black; list-style-type: square;">1</li>' +
        '<li style="color: green; list-style-type: disc;">parent' +
          '<ol>' +
            '<li style="color: red;"><span style="color: blue;">nested 1</span></li>' +
            '<li style="color: yellow;"><span style="color: purple;">nested mid</span></li>' +
          '</ol>' +
        '</li>' +
        '<li style="color: green; list-style-type: disc;"><span style="color: purple;">abc</span>' +
          '<ol><li style="color: red;"><span style="color: blue;">nested 2</span></li></ol>' +
        '</li>' +
      '</ol>');
    });
  });
});
