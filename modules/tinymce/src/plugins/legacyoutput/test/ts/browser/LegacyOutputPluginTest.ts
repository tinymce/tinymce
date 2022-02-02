import { describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/legacyoutput/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.legacyoutput.LegacyOutputPluginTest', () => {
  const formatsCell = Cell<any>({});
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'legacyoutput',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    font_formats: 'Arial=arial,helvetica,sans-serif;',
    setup: (editor) => {
      // Store the formats on `PostRender`, which is fired before the initial editor content is loaded
      editor.on('PostRender', () => {
        formatsCell.set({ ...editor.formatter.get() });
      });
    }
  }, [ Plugin, Theme ], true);

  it('TBA: Setting overrides', () => {
    const editor = hook.editor();
    assert.isFalse(editor.getParam('inline_styles'));
    assert.equal(editor.getParam('fontsize_formats'), '8pt=1 10pt=2 12pt=3 14pt=4 18pt=5 24pt=6 36pt=7');
    assert.equal(editor.getParam('font_formats'), 'Arial=arial,helvetica,sans-serif;');
  });

  it('TBA: Font color', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('forecolor', false, '#ff0000');
    TinyAssertions.assertContent(editor, '<p><font color="#ff0000">text</font></p>');
  });

  it('TBA: Font size', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('fontsize', false, 7);
    TinyAssertions.assertContent(editor, '<p><font size="7">text</font></p>');
  });

  it('TBA: Font face', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('fontname', false, 'times');
    TinyAssertions.assertContent(editor, '<p><font face="times">text</font></p>');
  });

  it('TBA: Bold', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('bold');
    TinyAssertions.assertContent(editor, '<p><b>text</b></p>');
  });

  it('TBA: Italic', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('italic');
    TinyAssertions.assertContent(editor, '<p><i>text</i></p>');
  });

  it('TBA: Underline', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('underline');
    TinyAssertions.assertContent(editor, '<p><u>text</u></p>');
  });

  it('TBA: Strikethrough', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('strikethrough');
    TinyAssertions.assertContent(editor, '<p><strike>text</strike></p>');
  });

  it('TBA: Justifyleft', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('justifyleft');
    TinyAssertions.assertContent(editor, '<p align="left">text</p>');
  });

  it('TBA: Justifycenter', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('justifycenter');
    TinyAssertions.assertContent(editor, '<p align="center">text</p>');
  });

  it('TBA: Justifyright', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('justifyright');
    TinyAssertions.assertContent(editor, '<p align="right">text</p>');
  });

  it('TBA: Justifyfull', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('justifyfull');
    TinyAssertions.assertContent(editor, '<p align="justify">text</p>');
  });

  it('TBA: Justifycenter image', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAF0lEQVR42mP8/5/hPwMJgHFUw6gG7AAAXVgj6XowjMAAAAAASUVORK5CYII=" /></p>');
    TinySelections.setCursor(editor, [ 0 ], 0);

    editor.execCommand('justifycenter');
    TinyAssertions.assertContent(editor, '<p align="center"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAF0lEQVR42mP8/5/hPwMJgHFUw6gG7AAAXVgj6XowjMAAAAAASUVORK5CYII=" /></p>');
  });

  it('TBA: Remove text color', () => {
    const editor = hook.editor();
    const format: any = 'forecolor';
    editor.setContent('<p><font color="red">text</font></p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0, 0 ], 4);

    editor.execCommand('mceRemoveTextcolor', format);
    TinyAssertions.assertContent(editor, '<p>text</p>');
  });

  it('TBA: Remove background color', () => {
    const editor = hook.editor();
    const format: any = 'hilitecolor';
    editor.setContent('<p><font style="background-color: red">text</font></p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0, 0 ], 4);

    editor.execCommand('mceRemoveTextcolor', format);
    TinyAssertions.assertContent(editor, '<p>text</p>');
  });

  it('TINY-4741: Convert bold to span if styling attributes are present on format removal', () => {
    const editor = hook.editor();
    editor.setContent('<p><b class="abc" style="color: red; font-size: 20px;" data-test="2">text</b></p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0, 0 ], 4);

    editor.execCommand('bold');
    TinyAssertions.assertContent(editor, '<p><span class="abc" style="color: red; font-size: 20px;">text</span></p>');
  });

  it('TBA: Formats registered before loading initial content', () => {
    const formats = formatsCell.get();
    assert.deepEqual(formats.bold[0], { inline: 'b', remove: 'all', deep: true, split: true, preserve_attributes: [ 'class', 'style' ] });
    assert.deepEqual(formats.italic[0], { inline: 'i', remove: 'all', deep: true, split: true, preserve_attributes: [ 'class', 'style' ] });
    assert.deepEqual(formats.underline[0], { inline: 'u', remove: 'all', deep: true, split: true, preserve_attributes: [ 'class', 'style' ] });
    assert.deepEqual(formats.fontname[0], { inline: 'font', toggle: false, attributes: { face: '%value' }, deep: true, split: true });
  });
});
