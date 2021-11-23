import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import * as Options from 'tinymce/plugins/toc/api/Options';

describe('browser.tinymce.plugins.toc.api.SettingsTest', () => {
  const setupEditor = (options: RawEditorOptions) => {
    const editor = new Editor('x', options, EditorManager);
    Options.register(editor);
    return editor;
  };

  it('getTocClass setting', () => {
    assert.equal(Options.getTocClass(setupEditor({})), 'mce-toc', 'Should be default toc class');
    assert.equal(Options.getTocClass(setupEditor({ toc_class: 'c' })), 'c', 'Should be specified toc class');
  });

  it('getTocHeader setting', () => {
    assert.equal(Options.getTocHeader(setupEditor({})), 'h2', 'Should be default h2');
    assert.equal(Options.getTocHeader(setupEditor({ toc_header: 'h3' })), 'h3', 'Should be h3');
    assert.equal(Options.getTocHeader(setupEditor({ toc_header: 'h75' })), 'h2', 'Should be h2 since h75 is invalid');
  });

  it('getTocDepth setting', () => {
    assert.equal(Options.getTocDepth(setupEditor({})), 3, 'Should be default 3');
    assert.equal(Options.getTocDepth(setupEditor({ toc_depth: 5 })), 5, 'Should be specified toc depth');
    assert.equal(Options.getTocDepth(setupEditor({ toc_depth: '5' })), 3, 'Should be default toc depth for invalid type');
    assert.equal(Options.getTocDepth(setupEditor({ toc_depth: 53 })), 3, 'Should be default toc depth for invalid number');
  });
});
