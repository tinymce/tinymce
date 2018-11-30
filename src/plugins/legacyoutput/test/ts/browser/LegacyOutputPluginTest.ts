import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/legacyoutput/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest(
  'browser.tinymce.plugins.legacyoutput.LegacyOutputPluginTest', (success, failure) => {

    // TODO FIXME DISABLED-TEST TINY-2301
    // Disable reason: plugin is not implemented yet...
    success();
    return;

    const suite = LegacyUnit.createSuite();

    Plugin();
    Theme();

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

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, Log.steps('TBA', 'LegacyOutput: Test legacy formatting', suite.toSteps(editor)), onSuccess, onFailure);
    }, {
      plugins: 'legacyoutput',
      indent: false,
      skin_url: '/project/js/tinymce/skins/oxide'
    }, success, failure);
  }
);
