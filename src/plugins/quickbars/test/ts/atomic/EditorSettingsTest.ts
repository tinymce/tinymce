import { Logger, RawAssertions, UnitTest } from '@ephox/agar';
import Settings from '../../../main/ts/api/Settings';
import { Editor } from 'tinymce/core/api/Editor';

UnitTest.test('DialogChanges', () => {
  Logger.sync(
    'Quick Toolbars plugin: Quick Toolbars Editor Settings and default values',
    () => {

      const test = (label: string, method: (editor: Editor) => string, settings: any, expected: string) => {
        const mockEditor = {
          settings
        } as any;

        Logger.sync(label, () => {
          const result = method(mockEditor);
          RawAssertions.assertEq(label, result, expected);
        });
      };

      test('getTextSelectionToolbarItems: testing for empty string should return empty string',
        Settings.getTextSelectionToolbarItems,
        {
          quickbars_selection_toolbar: ''
        },
        ''
      );

      test('getTextSelectionToolbarItems: testing for boolean false should return empty string',
        Settings.getTextSelectionToolbarItems,
        {
          quickbars_selection_toolbar: false
        },
        ''
      );

      test('getTextSelectionToolbarItems: testing for boolean true should fallback to defaults',
        Settings.getTextSelectionToolbarItems,
        {
          quickbars_selection_toolbar: true
        },
        'bold italic | form:link-form h2 h3 blockquote'
      );

      test('getTextSelectionToolbarItems: testing for undefined should fallback to defaults',
        Settings.getTextSelectionToolbarItems,
        {
          // intentionally blank undefined
        },
        'bold italic | form:link-form h2 h3 blockquote'
      );

      test('getTextSelectionToolbarItems: testing for custom config string',
        Settings.getTextSelectionToolbarItems,
        {
          quickbars_selection_toolbar: 'hello | friend'
        },
        'hello | friend'
      );

      test('getInsertToolbarItems: testing for empty string should return empty string',
        Settings.getInsertToolbarItems,
        {
          quickbars_insert_toolbar: ''
        },
        ''
      );

      test('getInsertToolbarItems: testing for boolean false should return empty string',
        Settings.getInsertToolbarItems,
        {
          quickbars_insert_toolbar: false
        },
        ''
      );

      test('getInsertToolbarItems: testing for boolean true should fallback to defaults',
        Settings.getInsertToolbarItems,
        {
          quickbars_insert_toolbar: true
        },
        'quickimage quicktable'
      );

      test('getInsertToolbarItems: testing for undefined should fallback to defaults',
        Settings.getInsertToolbarItems,
        {
          // intentionally blank undefined
        },
        'quickimage quicktable'
      );

      test('getInsertToolbarItems: testing for custom config string',
        Settings.getInsertToolbarItems,
        {
          quickbars_insert_toolbar: 'bye | now'
        },
        'bye | now'
      );

    }
  );
});