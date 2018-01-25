import { Assertions } from '@ephox/agar';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import PluginManager from 'tinymce/core/api/PluginManager';
import DetectProPlugin from 'tinymce/plugins/spellchecker/alien/DetectProPlugin';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test(
  'browser.tinymce.plugins.spellchecker.alien.DetectProPluginTest',
  function () {
    // Fake loading of tinymcespellchecker
    PluginManager.add('tinymcespellchecker', function () { });

    Assertions.assertEq('Should not have pro plugin', false, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste' }, EditorManager)));
    Assertions.assertEq('Should not have pro plugin', false, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: '' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'tinymcespellchecker' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste tinymcespellchecker' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'tinymcespellchecker paste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste tinymcespellchecker paste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste,tinymcespellchecker,paste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste  tinymcespellchecker  paste' }, EditorManager)));
  }
);
