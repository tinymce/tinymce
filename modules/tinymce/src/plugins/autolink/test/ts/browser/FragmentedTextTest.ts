import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/autolink/Plugin';

import * as KeyUtils from '../module/test/KeyUtils';

describe('browser.tinymce.plugins.autolink.FragmentedTextTest.ts', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'autolink',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TINY-3723: should detect URLs over fragmented text in inline elements', () => {
    const editor = hook.editor();
    editor.setContent('<p><span data-mce-spelling="invalid">www</span>.tiny.cloud</p>');
    TinySelections.setCursor(editor, [ 0, 1 ], '.tiny.cloud'.length);
    KeyUtils.type(editor, ' ');
    TinyAssertions.assertContent(editor, '<p><a href="https://www.tiny.cloud"><span data-mce-spelling="invalid">www</span>.tiny.cloud</a>&nbsp;</p>');
  });

  it('TINY-3723: should detect URLs over fragmented text nodes', () => {
    const editor = hook.editor();
    editor.setContent('<p>http://www.tiny.cloud/</p>');

    // Setup fragmented text nodes
    const para = editor.dom.select('p')[0];
    const textNode = para.firstChild as Text;
    textNode.splitText('http://'.length);

    TinySelections.setCursor(editor, [ 0, 1 ], 'www.tiny.cloud/'.length);
    KeyUtils.type(editor, ' ');
    TinyAssertions.assertContent(editor, '<p><a href="http://www.tiny.cloud/">http://www.tiny.cloud/</a>&nbsp;</p>');
  });

  it('TINY-3723: should not detect URLs separated by a line break', () => {
    const editor = hook.editor();

    editor.setContent('<p>http://www<br>.tiny.cloud/</p>');
    TinySelections.setCursor(editor, [ 0, 2 ], '.tiny.cloud/'.length);
    KeyUtils.type(editor, ' ');
    TinyAssertions.assertContent(editor, '<p>http://www<br>.tiny.cloud/&nbsp;</p>');

    editor.setContent('<p>http://www</p><p>.tiny.cloud/</p>');
    TinySelections.setCursor(editor, [ 1, 0 ], '.tiny.cloud/'.length);
    KeyUtils.type(editor, ' ');
    TinyAssertions.assertContent(editor, '<p>http://www</p><p>.tiny.cloud/&nbsp;</p>');
  });

  it('TINY-3723: should not detect URLs across cef boundaries', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">http://www</span>.tiny.cloud/</p>');

    TinySelections.setCursor(editor, [ 0, 2 ], '.tiny.cloud/'.length);
    KeyUtils.type(editor, ' ');
    TinyAssertions.assertContent(editor, '<p><span contenteditable="false">http://www</span>.tiny.cloud/&nbsp;</p>');
  });
});
