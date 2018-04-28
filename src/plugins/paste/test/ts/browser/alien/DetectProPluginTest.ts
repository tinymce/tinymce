import { Assertions } from '@ephox/agar';
import { Editor } from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import PluginManager from 'tinymce/core/api/PluginManager';
import DetectProPlugin from 'tinymce/plugins/paste/alien/DetectProPlugin';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('browser.tinymce.plugins.paste.alien.DetectProPluginTest', function () {
  // Fake loading of powerpaste
  PluginManager.add('powerpaste', function () { });

  Assertions.assertEq('Should not have pro plugin', false, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste' }, EditorManager)));
  Assertions.assertEq('Should not have pro plugin', false, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: '' }, EditorManager)));
  Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'powerpaste' }, EditorManager)));
  Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste powerpaste' }, EditorManager)));
  Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'powerpaste paste' }, EditorManager)));
  Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste powerpaste paste' }, EditorManager)));
  Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste,powerpaste,paste' }, EditorManager)));
  Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste  powerpaste  paste' }, EditorManager)));
});
