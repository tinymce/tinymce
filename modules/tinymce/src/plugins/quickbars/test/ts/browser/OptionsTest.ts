import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as Options from 'tinymce/plugins/quickbars/api/Options';

describe('browser.tinymce.plugins.quickbars.OptionsTest', () => {
  const test = (method: (editor: Editor) => string, options: any, expected: string) => () => {
    const editor = new Editor('test', options, EditorManager);
    Options.register(editor);

    const result = method(editor);
    assert.equal(result, expected);
  };

  context('getTextSelectionToolbarItems', () => {
    it('TBA: testing for empty string should return empty string', test(
      Options.getTextSelectionToolbarItems,
      { quickbars_selection_toolbar: '' },
      ''
    ));

    it('TBA: testing for boolean false should return empty string', test(
      Options.getTextSelectionToolbarItems,
      { quickbars_selection_toolbar: false },
      ''
    ));

    it('TBA: testing for boolean true should fallback to defaults', test(
      Options.getTextSelectionToolbarItems,
      { quickbars_selection_toolbar: true },
      'bold italic | quicklink h2 h3 blockquote'
    ));

    it('TBA: testing for undefined should fallback to defaults', test(
      Options.getTextSelectionToolbarItems,
      {
        // intentionally blank undefined
      },
      'bold italic | quicklink h2 h3 blockquote'
    ));

    it('TBA: testing for custom config string', test(
      Options.getTextSelectionToolbarItems,
      { quickbars_selection_toolbar: 'hello | friend' },
      'hello | friend'
    ));
  });

  context('getInsertToolbarItems', () => {
    it('TBA: testing for empty string should return empty string', test(
      Options.getInsertToolbarItems,
      { quickbars_insert_toolbar: '' },
      ''
    ));

    it('TBA: testing for boolean false should return empty string', test(
      Options.getInsertToolbarItems,
      { quickbars_insert_toolbar: false },
      ''
    ));

    it('TBA: testing for boolean true should fallback to defaults', test(
      Options.getInsertToolbarItems,
      { quickbars_insert_toolbar: true },
      'quickimage quicktable'
    ));

    it('TBA: testing for undefined should fallback to defaults', test(
      Options.getInsertToolbarItems,
      {
        // intentionally blank undefined
      },
      'quickimage quicktable'
    ));

    it('TBA: testing for custom config string', test(
      Options.getInsertToolbarItems,
      { quickbars_insert_toolbar: 'bye | now' },
      'bye | now'
    ));
  });
});
