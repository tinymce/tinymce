import { context, describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Settings from 'tinymce/plugins/quickbars/api/Settings';

describe('atomic.tinymce.plugins.quickbars.EditorSettingsTest', () => {
  const test = (method: (editor: Editor) => string, settings: any, expected: string) => () => {
    const mockEditor = {
      getParam: (name: string, defaultValue: any) => Obj.get(settings, name).getOr(defaultValue),
      settings
    } as Editor;

    const result = method(mockEditor);
    assert.equal(result, expected);
  };

  context('getTextSelectionToolbarItems', () => {
    it('TBA: testing for empty string should return empty string', test(
      Settings.getTextSelectionToolbarItems,
      { quickbars_selection_toolbar: '' },
      ''
    ));

    it('TBA: testing for boolean false should return empty string', test(
      Settings.getTextSelectionToolbarItems,
      { quickbars_selection_toolbar: false },
      ''
    ));

    it('TBA: testing for boolean true should fallback to defaults', test(
      Settings.getTextSelectionToolbarItems,
      { quickbars_selection_toolbar: true },
      'bold italic | quicklink h2 h3 blockquote'
    ));

    it('TBA: testing for undefined should fallback to defaults', test(
      Settings.getTextSelectionToolbarItems,
      {
        // intentionally blank undefined
      },
      'bold italic | quicklink h2 h3 blockquote'
    ));

    it('TBA: testing for custom config string', test(
      Settings.getTextSelectionToolbarItems,
      { quickbars_selection_toolbar: 'hello | friend' },
      'hello | friend'
    ));
  });

  context('getInsertToolbarItems', () => {
    it('TBA: testing for empty string should return empty string', test(
      Settings.getInsertToolbarItems,
      { quickbars_insert_toolbar: '' },
      ''
    ));

    it('TBA: testing for boolean false should return empty string', test(
      Settings.getInsertToolbarItems,
      { quickbars_insert_toolbar: false },
      ''
    ));

    it('TBA: testing for boolean true should fallback to defaults', test(
      Settings.getInsertToolbarItems,
      { quickbars_insert_toolbar: true },
      'quickimage quicktable'
    ));

    it('TBA: testing for undefined should fallback to defaults', test(
      Settings.getInsertToolbarItems,
      {
        // intentionally blank undefined
      },
      'quickimage quicktable'
    ));

    it('TBA: testing for custom config string', test(
      Settings.getInsertToolbarItems,
      { quickbars_insert_toolbar: 'bye | now' },
      'bye | now'
    ));
  });
});
