import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as Settings from 'tinymce/plugins/toc/api/Settings';

describe('browser.tinymce.plugins.toc.api.SettingsTest', () => {
  it('getTocClass setting', () => {
    assert.equal(Settings.getTocClass(new Editor('x', {}, EditorManager)), 'mce-toc', 'Should be default toc class');
    assert.equal(Settings.getTocClass(new Editor('x', { toc_class: 'c' }, EditorManager)), 'c', 'Should be specified toc class');
  });

  it('getTocHeader setting', () => {
    assert.equal(Settings.getTocHeader(new Editor('x', {}, EditorManager)), 'h2', 'Should be default h2');
    assert.equal(Settings.getTocHeader(new Editor('x', { toc_header: 'h3' }, EditorManager)), 'h3', 'Should be h3');
    assert.equal(Settings.getTocHeader(new Editor('x', { toc_header: 'h75' }, EditorManager)), 'h2', 'Should be h2 since h75 is invalid');
  });

  it('getTocDepth setting', () => {
    assert.equal(Settings.getTocDepth(new Editor('x', {}, EditorManager)), 3, 'Should be default 3');
    assert.equal(Settings.getTocDepth(new Editor('x', { toc_depth: '5' }, EditorManager)), 5, 'Should be specified toc depth (string)');
    assert.equal(Settings.getTocDepth(new Editor('x', { toc_depth: 5 }, EditorManager)), 5, 'Should be specified toc depth');
    assert.equal(Settings.getTocDepth(new Editor('x', { toc_depth: '53' }, EditorManager)), 3, 'Should be default toc depth for invalid');
  });
});
