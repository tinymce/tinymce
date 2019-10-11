import { Assertions } from '@ephox/agar';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import PluginManager from 'tinymce/core/api/PluginManager';
import DetectProPlugin from 'tinymce/plugins/paste/alien/DetectProPlugin';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('browser.tinymce.plugins.paste.alien.DetectProPluginTest', function () {
  // Fake loading of powerpaste
  PluginManager.add('powerpaste', function () { });

  Assertions.assertEq('TestCase-TBA: Paste: Should not have pro plugin', false, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste' }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: Paste: Should not have pro plugin', false, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: '' }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: Paste: Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'powerpaste' }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: Paste: Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste powerpaste' }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: Paste: Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'powerpaste paste' }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: Paste: Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste powerpaste paste' }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: Paste: Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste,powerpaste,paste' }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: Paste: Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste  powerpaste  paste' }, EditorManager)));
});
