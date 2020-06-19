import { Pipeline, Log } from '@ephox/agar';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { document, window, history } from '@ephox/dom-globals';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/autosave/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.autosave.AutoSavePluginTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  const checkIfEmpty = (editor: Editor, html: string, isEmpty: boolean): void => {
    const result = isEmpty ? 'empty.' : 'not empty.';

    Assert.eq('The HTML "' + html + '" is ' + result, editor.plugins.autosave.isEmpty(html), isEmpty);
  };

  suite.test('TestCase-TBA: AutoSave: isEmpty true', (editor) => {
    checkIfEmpty(editor, '', true);
    checkIfEmpty(editor, '   ', true);
    checkIfEmpty(editor, '\t\t\t', true);

    checkIfEmpty(editor, '<p id="x"></p>', true);
    checkIfEmpty(editor, '<p></p>', true);
    checkIfEmpty(editor, '<p> </p>', true);
    checkIfEmpty(editor, '<p>\t</p>', true);

    checkIfEmpty(editor, '<p><br></p>', true);
    checkIfEmpty(editor, '<p><br /></p>', true);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /></p>', true);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /></p>', true);

    checkIfEmpty(editor, '<h1></h1>', true);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /><br data-mce-bogus="true" /></p>', true);
  });

  suite.test('TestCase-TBA: AutoSave: isEmpty false', (editor) => {
    checkIfEmpty(editor, 'X', false);
    checkIfEmpty(editor, '   X', false);
    checkIfEmpty(editor, '\t\t\tX', false);

    checkIfEmpty(editor, '<p>X</p>', false);
    checkIfEmpty(editor, '<p> X</p>', false);
    checkIfEmpty(editor, '<p>\tX</p>', false);

    checkIfEmpty(editor, '<p><br>X</p>', false);
    checkIfEmpty(editor, '<p><br />X</p>', false);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" />X</p>', false);

    checkIfEmpty(editor, '<p><br><br></p>', false);
    checkIfEmpty(editor, '<p><br /><br /></p>', false);
    checkIfEmpty(editor, '<p><br><br>X</p>', false);
    checkIfEmpty(editor, '<p><br /><br />X</p>', false);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /><br data-mce-bogus="true" />X</p>', false);

    checkIfEmpty(editor, '<img src="x" />', false);
  });

  suite.test('TestCase-TBA: AutoSave: hasDraft/storeDraft/restoreDraft', (editor) => {
    Assert.eq('Check if it starts with a draft', editor.plugins.autosave.hasDraft(), false);

    editor.setContent('X');
    editor.undoManager.add();
    editor.plugins.autosave.storeDraft();

    Assert.eq('Check that adding a draft adds a draft', editor.plugins.autosave.hasDraft(), true);

    editor.setContent('Y');
    editor.undoManager.add();

    editor.plugins.autosave.restoreDraft();
    Assert.eq('Check that a draft can be restored', editor.getContent(), '<p>X</p>');
    editor.plugins.autosave.removeDraft();
  });

  suite.test('TestCase-TBA: AutoSave: recognises location hash change', (editor) => {
    Assert.eq('Check if it starts with a draft', editor.plugins.autosave.hasDraft(), false);

    editor.setContent('X');
    editor.undoManager.add();
    editor.plugins.autosave.storeDraft();

    window.location.hash = 'test' + Math.random().toString(36).substring(7);

    Assert.eq('Check if it notices a hash change', editor.plugins.autosave.hasDraft(), false);

    history.replaceState('', document.title, window.location.pathname + window.location.search);
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, Log.steps('TBA', 'AutoSave: Test autosave isEmpty true/false, drafts and location hash change', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    plugins: 'autosave',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
