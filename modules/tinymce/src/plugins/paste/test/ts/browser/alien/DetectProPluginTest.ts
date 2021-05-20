import { after, before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as DetectProPlugin from 'tinymce/plugins/paste/alien/DetectProPlugin';

describe('browser.tinymce.plugins.paste.alien.DetectProPluginTest', () => {
  before(() => {
    // Fake loading of powerpaste
    PluginManager.add('powerpaste', Fun.noop);
  });

  after(() => {
    PluginManager.remove('powerpaste');
  });

  it('should not detect the powerpaste plugin is enabled', () => {
    assert.isFalse(DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste' }, EditorManager)));
    assert.isFalse(DetectProPlugin.hasProPlugin(new Editor('id', { plugins: '' }, EditorManager)));
  });

  it('should detect the powerpaste plugin is enabled', () => {
    assert.isTrue(DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'powerpaste' }, EditorManager)));
    assert.isTrue(DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste powerpaste' }, EditorManager)));
    assert.isTrue(DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'powerpaste paste' }, EditorManager)));
    assert.isTrue(DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste powerpaste paste' }, EditorManager)));
    assert.isTrue(DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste,powerpaste,paste' }, EditorManager)));
    assert.isTrue(DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste  powerpaste  paste' }, EditorManager)));
  });
});
