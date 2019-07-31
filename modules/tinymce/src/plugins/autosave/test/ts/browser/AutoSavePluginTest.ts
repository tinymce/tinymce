import { Pipeline, Log } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/autosave/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document, window, history } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.plugins.autosave.AutoSavePluginTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: AutoSave: isEmpty true', function (editor) {
    LegacyUnit.equal(editor.plugins.autosave.isEmpty(''), true);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('   '), true);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('\t\t\t'), true);

    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p id="x"></p>'), true);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p></p>'), true);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p> </p>'), true);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p>\t</p>'), true);

    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br></p>'), true);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br /></p>'), true);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" /></p>'), true);

    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br><br></p>'), true);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br /><br /></p>'), true);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" /><br data-mce-bogus="true" /></p>'), true);
  });

  suite.test('TestCase-TBA: AutoSave: isEmpty false', function (editor) {
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('X'), false);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('   X'), false);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('\t\t\tX'), false);

    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p>X</p>'), false);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p> X</p>'), false);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p>\tX</p>'), false);

    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br>X</p>'), false);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br />X</p>'), false);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" />X</p>'), false);

    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br><br>X</p>'), false);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br /><br />X</p>'), false);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" /><br data-mce-bogus="true" />X</p>'), false);

    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<h1></h1>'), false);
    LegacyUnit.equal(editor.plugins.autosave.isEmpty('<img src="x" />'), false);
  });

  suite.test('TestCase-TBA: AutoSave: hasDraft/storeDraft/restoreDraft', function (editor) {
    LegacyUnit.equal(editor.plugins.autosave.hasDraft(), false);

    editor.setContent('X');
    editor.undoManager.add();
    editor.plugins.autosave.storeDraft();

    LegacyUnit.equal(editor.plugins.autosave.hasDraft(), true);

    editor.setContent('Y');
    editor.undoManager.add();

    editor.plugins.autosave.restoreDraft();
    LegacyUnit.equal(editor.getContent(), '<p>X</p>');
    editor.plugins.autosave.removeDraft();
  });

  suite.test('TestCase-TBA: AutoSave: recognises location hash change', function (editor) {
    LegacyUnit.equal(editor.plugins.autosave.hasDraft(), false);

    editor.setContent('X');
    editor.undoManager.add();
    editor.plugins.autosave.storeDraft();

    window.location.hash = 'test' + Math.random().toString(36).substring(7);

    LegacyUnit.equal(editor.plugins.autosave.hasDraft(), false);

    history.replaceState('', document.title, window.location.pathname + window.location.search);
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'AutoSave: Test autosave isEmpty true/false, drafts and location hash change', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    plugins: 'autosave',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
