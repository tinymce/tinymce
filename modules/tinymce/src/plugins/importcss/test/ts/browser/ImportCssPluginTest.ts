import { Step, Pipeline, Chain, UiFinder, Assertions, ApproxStructure, GeneralSteps, Mouse, Log } from '@ephox/agar';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';
import Plugin from 'tinymce/plugins/importcss/Plugin';
import { Body, Element } from '@ephox/sugar';
import { Arr, Option } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.plugins.importcss.ImportCssTest', (success, failure) => {

  Plugin();
  Theme();

  const sTestEditorWithSettings = (assertions, pluginSettings) => Step.async((onStepSuccess, onStepFailure) => {
    TinyLoader.setupLight((editor, onSuccess, onFailure) => {

      const tinyUi = TinyUi(editor);

      const sAssertMenu = (label: string, expected, hasIcons) => {
        return Chain.asStep(Body.body(), [
          UiFinder.cWaitForVisible('Waiting for styles menu to appear', '[role="menu"]'),
          Assertions.cAssertStructure('Checking structure', ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-menu') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-collection__group') ],
                  children: Arr.map(expected, (exp) => {
                    return s.element('div', {
                      classes: [ arr.has('tox-collection__item') ],
                      children: [
                        ...hasIcons ? [ s.element('div', { classes: [ arr.has('tox-collection__item-icon') ]}) ] : [ ],
                        s.element('div', exp.submenu ? {
                          classes: [ arr.has('tox-collection__item-label') ],
                          html: str.is(exp.html)
                        } : {
                          classes: [ arr.has('tox-collection__item-label') ],
                          children: [
                            s.element(exp.tag, { html: str.is(exp.html) })
                          ]
                        })
                      ].concat(exp.submenu ? [ s.anything() ] : [ ])
                    });
                  })
                })
              ]
            });
          }))
        ]);
      };

      const sOpenStyleMenu = GeneralSteps.sequence([
        tinyUi.sClickOnToolbar('Clicking on the styleselect dropdown', 'button')
      ]);

      Pipeline.async({}, [
        sOpenStyleMenu,
        sAssertMenu('Checking stuff', assertions.menuContents, assertions.menuHasIcons)
      ].concat(assertions.choice.map((c) => [
          Assertions.sAssertPresence(
            `${c} should NOT be present before clicking`,
            {
              [c]: 0
            },
            Element.fromDom(editor.getBody())
          ),
          Mouse.sClickOn(Body.body(), `.tox-collection__item .tox-collection__item-label:contains(${c})`),
          Assertions.sAssertPresence(
            `${c} should be present`,
            {
              [c]: 1
            },
            Element.fromDom(editor.getBody())
          )
        ]).getOr([ ])), onSuccess, onFailure);
    }, {
      plugins: 'importcss',
      toolbar: 'styleselect',
      theme: 'silver',
      content_css: pluginSettings.content_css,
      importcss_append: pluginSettings.importcss_append,
      importcss_selector_filter: pluginSettings.importcss_selector_filter,
      importcss_file_filter: pluginSettings.importcss_file_filter,
      importcss_groups: pluginSettings.importcss_groups,
      importcss_selector_converter: pluginSettings.importcss_selector_converter,
      importcss_exclusive: pluginSettings.importcss_exclusive,
      base_url: '/project/tinymce/js/tinymce'
    }, () => onStepSuccess(), onStepFailure);
  });

  Pipeline.async({ }, [
    Log.step(
      'TBA',
      'importcss: content_css with one file, append default',
      sTestEditorWithSettings(
        {
          menuContents: [
            { tag: 'h1', html: 'h1.red', submenu: false },
            { tag: 'p', html: 'p.other', submenu: false },
            { tag: 'span', html: 'span.inline', submenu: false }
          ],
          menuHasIcons: true,
          choice: Option.some('h1.red')
        },
        {
          content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
          importcss_append: undefined
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with no files, append true',
      sTestEditorWithSettings(
        {
          menuContents: [
            { html: 'Headings', submenu: true },
            { html: 'Inline', submenu: true },
            { html: 'Blocks', submenu: true },
            { html: 'Align', submenu: true }
          ],
          menuHasIcons: false,
          choice: Option.none()
        },
        {
          content_css: [ ],
          importcss_append: true
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with a file, append true',
      sTestEditorWithSettings(
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
          choice: Option.none()
        },
        {
          content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
          importcss_append: true
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with multiple files, append true',
      sTestEditorWithSettings(
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
          choice: Option.none()
        },
        {
          content_css: [
            '/project/tinymce/src/plugins/importcss/test/css/basic.css',
            '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
            '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
          ],
          importcss_append: true
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with one file, with merge classes',
      sTestEditorWithSettings(
        {
          menuContents: [
            { tag: 'h1', html: 'h1.red', submenu: false },
            { tag: 'p', html: 'p.other', submenu: false },
            { tag: 'span', html: 'span.inline', submenu: false }
          ],
          menuHasIcons: true,
          choice: Option.none()
        },
        {
          content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
          importcss_merge_classes: false
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with one file, append false, selector filter (string)',
      sTestEditorWithSettings(
        {
          menuContents: [
            { tag: 'h1', html: 'h1.red', submenu: false }
          ],
          menuHasIcons: true,
          choice: Option.some('h1.red')
        },
        {
          content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
          importcss_append: false,
          importcss_selector_filter: '.red'
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with one file, append false, selector filter (function)',
      sTestEditorWithSettings(
        {
          menuContents: [
            { tag: 'p', html: 'p.other', submenu: false },
            { tag: 'span', html: 'span.inline', submenu: false }
          ],
          menuHasIcons: true,
          choice: Option.some('p.other')
        },
        {
          content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
          importcss_append: false,
          importcss_selector_filter: (sel) => {
            return sel.indexOf('p') > -1 || sel.indexOf('inline') > -1;
          }
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with one file, append false, selector filter (regex)',
      sTestEditorWithSettings(
        {
          menuContents: [
            { tag: 'span', html: 'span.inline', submenu: false }
          ],
          menuHasIcons: true,
          choice: Option.some('span.inline')
        },
        {
          content_css: [ '/project/tinymce/src/plugins/importcss/test/css/basic.css' ],
          importcss_append: false,
          importcss_selector_filter: /inline/
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with three files, append false, file_filter (string)',
      sTestEditorWithSettings(
        {
          menuContents: [
            { tag: 'h2', html: 'h2.advanced', submenu: false },
            { tag: 'h3', html: 'h3.advanced', submenu: false }
          ],
          menuHasIcons: true,
          choice: Option.some('h2.advanced')
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
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with three files, append false, file_filter (function)',
      sTestEditorWithSettings(
        {
          menuContents: [
            { tag: 'h2', html: 'h2.advanced', submenu: false },
            { tag: 'h3', html: 'h3.advanced', submenu: false },
            { tag: 'h4', html: 'h4.advanced', submenu: false }
          ],
          menuHasIcons: true,
          choice: Option.some('h2.advanced')
        },
        {
          content_css: [
            '/project/tinymce/src/plugins/importcss/test/css/basic.css',
            '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
            '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
          ],
          importcss_append: false,
          importcss_file_filter: (href) => {
            return href.indexOf('adv') > -1;
          }
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with three files, append false, file_filter (regex)',
      sTestEditorWithSettings(
        {
          menuContents: [
            { tag: 'h2', html: 'h2.advanced', submenu: false },
            { tag: 'h3', html: 'h3.advanced', submenu: false },
            { tag: 'h4', html: 'h4.advanced', submenu: false }
          ],
          menuHasIcons: true,
          choice: Option.some('h2.advanced')
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
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with three files, append false, groups',
      sTestEditorWithSettings(
        {
          menuContents: [
            { html: 'Other', submenu: true },
            { html: 'Advanced', submenu: true }
          ],
          menuHasIcons: false,
          choice: Option.none()
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
      )
    )
  ], () => success(), failure);

});
