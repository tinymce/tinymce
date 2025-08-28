import { Assertions, Keys } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarDocument } from '@ephox/sugar';
import { McEditor, TinyDom, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import { Group } from 'tinymce/plugins/importcss/core/ImportCss';
import Plugin from 'tinymce/plugins/importcss/Plugin';

import { Navigation, pProcessNavigation } from '../module/MenuNavigationTestUtils';

interface Assertion {
  readonly choice: {
    readonly keysBeforeExecute: number[];
    readonly presence: string;
  };
  readonly navigation: Navigation[];
}

describe('browser.tinymce.plugins.importcss.ImportCssGroupsTest', () => {
  before(() => {
    Plugin();
  });

  const pTestEditorWithSettings = async (assertion: Assertion, pluginSettings: RawEditorOptions) => {
    const editor = await McEditor.pFromSettings<Editor>({
      plugins: 'importcss',
      toolbar: 'styles',
      content_css: pluginSettings.content_css,
      importcss_append: pluginSettings.importcss_append,
      importcss_selector_filter: pluginSettings.importcss_selector_filter,
      importcss_file_filter: pluginSettings.importcss_file_filter,
      importcss_groups: pluginSettings.importcss_groups,
      importcss_selector_converter: pluginSettings.importcss_selector_converter,
      importcss_exclusive: pluginSettings.importcss_exclusive,
      base_url: '/project/tinymce/js/tinymce'
    });

    Assertions.assertPresence(
      `${assertion.choice.presence} should NOT be present`,
      {
        [assertion.choice.presence]: 0
      },
      TinyDom.body(editor)
    );
    TinyUiActions.clickOnToolbar(editor, 'button');
    await pProcessNavigation(SugarDocument.getDocument(), assertion.navigation);
    Arr.each(assertion.choice.keysBeforeExecute, (k) => TinyUiActions.keydown(editor, k));
    TinyUiActions.keydown(editor, Keys.enter());
    Assertions.assertPresence(
      `${assertion.choice.presence} should now be present`,
      {
        [assertion.choice.presence]: 1
      },
      TinyDom.body(editor)
    );
    McEditor.remove(editor);
  };

  it('TBA: content_css with three files, append false, groups with overall selector converter', () => pTestEditorWithSettings(
    {
      navigation: [
        { item: 'Other', subitems: [ 'h1.red.DDD', 'p.other.DDD', 'span.inline.DDD' ] },
        { item: 'Advanced', subitems: [ 'h2.advanced.CCC', 'h3.advanced.CCC', 'h4.advanced.CCC' ] }
      ],
      choice: {
        keysBeforeExecute: [ Keys.right() ],
        presence: 'span.converted'
      }
    },
    {
      content_css: [
        '/project/tinymce/src/plugins/importcss/test/css/basic.css',
        '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
        '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
      ],
      importcss_append: false,
      importcss_groups: [
        { title: 'Advanced', filter: /.adv/, custom: '.CCC' },
        { title: 'Other', custom: '.DDD' }
      ],

      importcss_selector_converter: (selector: string, group: Group & { custom: string }) => ({
        title: selector + group.custom,
        classes: [ 'converted' ],
        inline: 'span'
      })
    }
  ));

  it('TBA: content_css with three files, append false, groups with group selector converters', () => pTestEditorWithSettings(
    {
      navigation: [
        { item: 'Other', subitems: [ 'h1.red.OtherGroup', 'p.other.OtherGroup', 'span.inline.OtherGroup' ] },
        { item: 'Advanced', subitems: [ 'h2.advanced.AdvGroup', 'h3.advanced.AdvGroup', 'h4.advanced.AdvGroup' ] }
      ],
      choice: {
        keysBeforeExecute: [ Keys.down(), Keys.right() ],
        presence: 'p.advanced'
      }
    },
    {
      content_css: [
        '/project/tinymce/src/plugins/importcss/test/css/basic.css',
        '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
        '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
      ],
      importcss_append: false,
      importcss_groups: [
        {
          title: 'Advanced',
          filter: /.adv/,
          selector_converter: (selector: string, group: Group | null) => {
            // eslint-disable-next-line no-console
            console.log('selector', selector, 'group', group);
            return {
              title: selector + '.AdvGroup',
              // NOTE: This is required so that it isn't disabled.
              selector: 'p',
              classes: selector.split('.')[1]
            };
          }
        },
        {
          title: 'Other',
          selector_converter: (selector: string, _group: Group | null) => ({
            title: selector + '.OtherGroup',
            selector: 'p',
            classes: selector.split('.')[1]
          })
        }
      ]
    }
  ));

  it('TBA: content_css with four files (one with clash), groups, and exclusive = false', () => pTestEditorWithSettings(
    {
      navigation: [
        { item: 'Other', subitems: [ 'h1.red', 'p.other', 'span.inline', 'h2.advanced', 'h3.advanced', 'h4.advanced' ] },
        { item: 'Advanced', subitems: [ 'h2.advanced', 'h3.advanced', 'h4.advanced' ] }
      ],
      choice: {
        keysBeforeExecute: [ Keys.right() ],
        presence: 'h1.red'
      }
    },
    {
      content_css: [
        '/project/tinymce/src/plugins/importcss/test/css/basic.css',
        '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
        '/project/tinymce/src/plugins/importcss/test/css/other-adv.css',
        '/project/tinymce/src/plugins/importcss/test/css/clashing.css'
      ],
      importcss_append: false,
      importcss_exclusive: false,
      importcss_groups: [
        { title: 'Advanced', filter: /.adv/ },
        { title: 'Other', custom: 'B' }
      ]
    }
  ));

  it('TBA: content_css with four files (one with clash), groups, and exclusive = true', () => pTestEditorWithSettings(
    {
      navigation: [
        { item: 'Other', subitems: [ 'h1.red', 'p.other', 'span.inline' ] },
        { item: 'Advanced', subitems: [ 'h2.advanced', 'h3.advanced', 'h4.advanced' ] }
      ],
      choice: {
        keysBeforeExecute: [ Keys.right(), Keys.down() ],
        presence: 'p.other'
      }
    },
    {
      content_css: [
        '/project/tinymce/src/plugins/importcss/test/css/basic.css',
        '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
        '/project/tinymce/src/plugins/importcss/test/css/other-adv.css',
        '/project/tinymce/src/plugins/importcss/test/css/clashing.css'
      ],
      importcss_append: false,
      importcss_exclusive: true,
      importcss_groups: [
        { title: 'Advanced', filter: /.adv/ },
        { title: 'Other', custom: 'B' }
      ]
    }
  ));
});
