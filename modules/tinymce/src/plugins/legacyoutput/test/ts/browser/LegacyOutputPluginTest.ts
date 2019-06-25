import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/legacyoutput/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest(
  'browser.tinymce.plugins.legacyoutput.LegacyOutputPluginTest', (success, failure) => {
    const suite = LegacyUnit.createSuite();

    Plugin();
    Theme();

    suite.test('TestCase-TBA: LegacyOutput: Setting overrides', function (editor) {
      LegacyUnit.equal(editor.getParam('inline_styles'), false);
      LegacyUnit.equal(editor.getParam('fontsize_formats'), '8pt=1 10pt=2 12pt=3 14pt=4 18pt=5 24pt=6 36pt=7');
      LegacyUnit.equal(editor.getParam('font_formats'), 'Arial=arial,helvetica,sans-serif;');
    });

    suite.test('TestCase-TBA: LegacyOutput: Font color', function (editor) {
      editor.focus();
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('forecolor', false, '#FF0000');
      LegacyUnit.equal(editor.getContent().toLowerCase(), '<p><font color="#ff0000">text</font></p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Font size', function (editor) {
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('fontsize', false, 7);
      LegacyUnit.equal(editor.getContent(), '<p><font size="7">text</font></p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Font face', function (editor) {
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('fontname', false, 'times');
      LegacyUnit.equal(editor.getContent(), '<p><font face="times">text</font></p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Bold', function (editor) {
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('bold');
      LegacyUnit.equal(editor.getContent(), '<p><b>text</b></p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Italic', function (editor) {
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('italic');
      LegacyUnit.equal(editor.getContent(), '<p><i>text</i></p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Underline', function (editor) {
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('underline');
      LegacyUnit.equal(editor.getContent(), '<p><u>text</u></p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Strikethrough', function (editor) {
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('strikethrough');
      LegacyUnit.equal(editor.getContent(), '<p><strike>text</strike></p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Justifyleft', function (editor) {
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('justifyleft');
      LegacyUnit.equal(editor.getContent(), '<p align="left">text</p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Justifycenter', function (editor) {
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('justifycenter');
      LegacyUnit.equal(editor.getContent(), '<p align="center">text</p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Justifyright', function (editor) {
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('justifyright');
      LegacyUnit.equal(editor.getContent(), '<p align="right">text</p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Justifyfull', function (editor) {
      editor.setContent('<p>text</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
      editor.execCommand('justifyfull');
      LegacyUnit.equal(editor.getContent(), '<p align="justify">text</p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Justifycenter image', function (editor) {
      editor.setContent('<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAF0lEQVR42mP8/5/hPwMJgHFUw6gG7AAAXVgj6XowjMAAAAAASUVORK5CYII=" /></p>');
      LegacyUnit.setSelection(editor, 'p', 0);
      editor.execCommand('justifycenter');
      LegacyUnit.equal(editor.getContent(), '<p align="center"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAF0lEQVR42mP8/5/hPwMJgHFUw6gG7AAAXVgj6XowjMAAAAAASUVORK5CYII=" /></p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Remove text color', function (editor) {
      editor.setContent('<p><font color="red">text</font></p>');
      LegacyUnit.setSelection(editor, 'font', 0, 'font', 4);
      editor.execCommand('mceRemoveTextcolor', 'forecolor');
      LegacyUnit.equal(editor.getContent(), '<p>text</p>');
    });

    suite.test('TestCase-TBA: LegacyOutput: Remove background color', function (editor) {
      editor.setContent('<p><font style="background-color: red">text</font></p>');
      LegacyUnit.setSelection(editor, 'font', 0, 'font', 4);
      editor.execCommand('mceRemoveTextcolor', 'hilitecolor');
      LegacyUnit.equal(editor.getContent(), '<p>text</p>');
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, Log.steps('TBA', 'LegacyOutput: Test legacy formatting', suite.toSteps(editor)), onSuccess, onFailure);
    }, {
      plugins: 'legacyoutput',
      indent: false,
      base_url: '/project/tinymce/js/tinymce',
      font_formats: 'Arial=arial,helvetica,sans-serif;'
    }, success, failure);
  }
);
