import { ApproxStructure, Assertions, Mouse, UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { McEditor, TinyDom, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import Plugin from 'tinymce/plugins/importcss/Plugin';

interface MenuTagDetails {
  readonly tag: string;
  readonly html: string;
  readonly submenu: false;
}

interface MenuSubmenuDetails {
  readonly html: string;
  readonly submenu: true;
}

type MenuDetails = MenuTagDetails | MenuSubmenuDetails;

interface Assertion {
  readonly choice: Optional<string>;
  readonly menuHasIcons?: boolean;
  readonly menuContents: MenuDetails[];
}

describe('browser.tinymce.plugins.importcss.ImportCssTest', () => {
  before(() => {
    Plugin();
  });

  const pAssertMenu = async (label: string, expected: MenuDetails[]) => {
    const menu = await UiFinder.pWaitForVisible('Waiting for styles menu to appear', SugarBody.body(), '[role="menu"]');
    Assertions.assertStructure('Checking structure', ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-menu') ],
      children: [
        s.element('div', {
          classes: [ arr.has('tox-collection__group') ],
          children: Arr.map(expected, (exp) => s.element('div', {
            classes: [ arr.has('tox-collection__item') ],
            children: [
              s.element('div', exp.submenu ? {
                classes: [ arr.has('tox-collection__item-label') ],
                html: str.is(exp.html)
              } : {
                classes: [ arr.has('tox-collection__item-label') ],
                children: [
                  s.element(exp.tag, { html: str.is(exp.html) })
                ]
              })
            ].concat(exp.submenu ? [ s.anything() ] : [ s.element('div', { classes: [ arr.has('tox-collection__item-checkmark') ] }) ])
          }))
        })
      ]
    })), menu);
  };

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

    TinyUiActions.clickOnToolbar(editor, 'button');
    await pAssertMenu('Checking stuff', assertion.menuContents);

    assertion.choice.each((c) => {
      Assertions.assertPresence(
        `${c} should NOT be present before clicking`,
        {
          [c]: 0
        },
        TinyDom.body(editor)
      );
      Mouse.clickOn(SugarBody.body(), `.tox-collection__item .tox-collection__item-label:contains(${c})`);
      Assertions.assertPresence(
        `${c} should be present`,
        {
          [c]: 1
        },
        TinyDom.body(editor)
      );
    });

    McEditor.remove(editor);
  };

  it('TBA: content_css with one file, append default', () => pTestEditorWithSettings(
    {
      menuContents: [
        { tag: 'h1', html: 'h1.red', submenu: false },
        { tag: 'p', html: 'p.other', submenu: false },
        { tag: 'span', html: 'span.inline', submenu: false }
      ],
      choice: Optional.some('h1.red')
    },
    {
      content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
      importcss_append: undefined
    }
  ));

  it('TBA: content_css with no files, append true', () => pTestEditorWithSettings(
    {
      menuContents: [
        { html: 'Headings', submenu: true },
        { html: 'Inline', submenu: true },
        { html: 'Blocks', submenu: true },
        { html: 'Align', submenu: true }
      ],
      menuHasIcons: false,
      choice: Optional.none()
    },
    {
      content_css: [ ],
      importcss_append: true
    }
  ));

  it('TBA: content_css with a file, append true', () => pTestEditorWithSettings(
    {
      menuContents: [
        { html: 'Headings', submenu: true },
        { html: 'Inline', submenu: true },
        { html: 'Blocks', submenu: true },
        { html: 'Align', submenu: true },
        { tag: 'h1', html: 'h1.red', submenu: false },
        { tag: 'p', html: 'p.other', submenu: false },
        { tag: 'span', html: 'span.inline', submenu: false }
      ],
      menuHasIcons: true,
      choice: Optional.none()
    },
    {
      content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
      importcss_append: true
    }
  ));

  it('TBA: content_css with multiple files, append true', () => pTestEditorWithSettings(
    {
      menuContents: [
        { html: 'Headings', submenu: true },
        { html: 'Inline', submenu: true },
        { html: 'Blocks', submenu: true },
        { html: 'Align', submenu: true },
        { tag: 'h1', html: 'h1.red', submenu: false },
        { tag: 'p', html: 'p.other', submenu: false },
        { tag: 'span', html: 'span.inline', submenu: false },
        { tag: 'h2', html: 'h2.advanced', submenu: false },
        { tag: 'h3', html: 'h3.advanced', submenu: false },
        { tag: 'h4', html: 'h4.advanced', submenu: false }
      ],
      menuHasIcons: true,
      choice: Optional.none()
    },
    {
      content_css: [
        '/project/tinymce/src/plugins/importcss/test/css/basic.css',
        '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
        '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
      ],
      importcss_append: true
    }
  ));

  it('TBA: content_css with one file, with merge classes', () => pTestEditorWithSettings(
    {
      menuContents: [
        { tag: 'h1', html: 'h1.red', submenu: false },
        { tag: 'p', html: 'p.other', submenu: false },
        { tag: 'span', html: 'span.inline', submenu: false }
      ],
      menuHasIcons: true,
      choice: Optional.none()
    },
    {
      content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
      importcss_merge_classes: false
    }
  ));

  it('TBA: content_css with one file, append false, selector filter (string)', () => pTestEditorWithSettings(
    {
      menuContents: [
        { tag: 'h1', html: 'h1.red', submenu: false }
      ],
      menuHasIcons: true,
      choice: Optional.some('h1.red')
    },
    {
      content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
      importcss_append: false,
      importcss_selector_filter: '.red'
    }
  ));

  it('TBA: content_css with one file, append false, selector filter (function)', () => pTestEditorWithSettings(
    {
      menuContents: [
        { tag: 'p', html: 'p.other', submenu: false },
        { tag: 'span', html: 'span.inline', submenu: false }
      ],
      menuHasIcons: true,
      choice: Optional.some('p.other')
    },
    {
      content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
      importcss_append: false,
      importcss_selector_filter: (sel: string) => sel.indexOf('p') > -1 || sel.indexOf('inline') > -1
    }
  ));

  it('TBA: content_css with one file, append false, selector filter (regex)', () => pTestEditorWithSettings(
    {
      menuContents: [
        { tag: 'span', html: 'span.inline', submenu: false }
      ],
      menuHasIcons: true,
      choice: Optional.some('span.inline')
    },
    {
      content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
      importcss_append: false,
      importcss_selector_filter: /inline/
    }
  ));

  it('TBA: content_css with three files, append false, file_filter (string)', () => pTestEditorWithSettings(
    {
      menuContents: [
        { tag: 'h2', html: 'h2.advanced', submenu: false },
        { tag: 'h3', html: 'h3.advanced', submenu: false }
      ],
      menuHasIcons: true,
      choice: Optional.some('h2.advanced')
    },
    {
      content_css: [
        '/project/tinymce/src/plugins/importcss/test/css/basic.css',
        '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
        '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
      ],
      importcss_append: false,
      importcss_file_filter: 'advanced.css'
    }
  ));

  it('TBA: content_css with three files, append false, file_filter (function)', () => pTestEditorWithSettings(
    {
      menuContents: [
        { tag: 'h2', html: 'h2.advanced', submenu: false },
        { tag: 'h3', html: 'h3.advanced', submenu: false },
        { tag: 'h4', html: 'h4.advanced', submenu: false }
      ],
      menuHasIcons: true,
      choice: Optional.some('h2.advanced')
    },
    {
      content_css: [
        '/project/tinymce/src/plugins/importcss/test/css/basic.css',
        '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
        '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
      ],
      importcss_append: false,
      importcss_file_filter: (href: string) => href.indexOf('adv') > -1
    }
  ));

  it('TBA: content_css with three files, append false, file_filter (regex)', () => pTestEditorWithSettings(
    {
      menuContents: [
        { tag: 'h2', html: 'h2.advanced', submenu: false },
        { tag: 'h3', html: 'h3.advanced', submenu: false },
        { tag: 'h4', html: 'h4.advanced', submenu: false }
      ],
      menuHasIcons: true,
      choice: Optional.some('h2.advanced')
    },
    {
      content_css: [
        '/project/tinymce/src/plugins/importcss/test/css/basic.css',
        '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
        '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
      ],
      importcss_append: false,
      importcss_file_filter: /adv/
    }
  ));

  it('TBA: content_css with three files, append false, groups', () => pTestEditorWithSettings(
    {
      menuContents: [
        { html: 'Other', submenu: true },
        { html: 'Advanced', submenu: true }
      ],
      menuHasIcons: false,
      choice: Optional.none()
    },
    {
      content_css: [
        '/project/tinymce/src/plugins/importcss/test/css/basic.css',
        '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
        '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
      ],
      importcss_append: false,
      importcss_groups: [
        { title: 'Advanced', filter: /.adv/ },
        { title: 'Other', custom: 'B' }
      ]
    }
  ));

  it('TINY-8238: content_css with two files, basic and internal CSS classes', () => pTestEditorWithSettings(
    {
      menuContents: [
        { tag: 'h1', html: 'h1.red', submenu: false },
        { tag: 'p', html: 'p.other', submenu: false },
        { tag: 'span', html: 'span.inline', submenu: false }
      ],
      choice: Optional.some('h1.red')
    },
    {
      content_css: [
        '/project/tinymce/src/plugins/importcss/test/css/basic.css',
        '/project/tinymce/src/plugins/importcss/test/css/internal.css'
      ],
      importcss_append: undefined
    }
  ));
});
