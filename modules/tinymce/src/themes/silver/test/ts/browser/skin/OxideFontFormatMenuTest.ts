import { ApproxStructure, Assertions, FocusTools, Keys } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.skin.OxideFontFormatMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'styles',
    style_formats: [
      { title: 'Title', format: 'h1' },
      { title: 'Main heading', format: 'h2' },
      { title: 'Sub heading', format: 'h3' },
      { title: 'Example Separator' },
      { title: 'Paragraph', format: 'p' },
      { title: 'Blockquote', format: 'blockquote' },
      { title: 'Code', format: 'pre' },
      {
        title: 'Others',
        items: [
          { title: 'Other1', format: 'bold' }
        ]
      },
      { title: 'Red text', inline: 'span', styles: { color: 'rgb(255, 0, 0)' }},
      { title: 'Red paragraph', block: 'p', styles: { color: 'rgb(255, 0, 0)' }},
      { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' }
    ]
  }, []);

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    ':focus { background-color: rgb(222, 224, 226); }',
    '.tox-collection__item-label > * { margin: 0px; }'
  ]);

  it('TBA: Check structure of font format', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    editor.setContent('<blockquote>Text</blockquote>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'Te'.length);

    TinyUiActions.clickOnToolbar(editor, 'button');
    const menu = await TinyUiActions.pWaitForPopup(editor, '[role="menu"]');
    Assertions.assertStructure(
      'Checking structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-menu'), arr.has('tox-collection'), arr.has('tox-collection--list') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    children: [
                      s.element('h1', { html: str.is('Title') })
                    ]
                  }),
                  s.element('div', { classes: [ arr.has('tox-collection__item-checkmark') ] })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    children: [
                      s.element('h2', { html: str.is('Main heading') })
                    ]
                  }),
                  s.element('div', { classes: [ arr.has('tox-collection__item-checkmark') ] })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    children: [
                      s.element('h3', { html: str.is('Sub heading') })
                    ]
                  }),
                  s.element('div', { classes: [ arr.has('tox-collection__item-checkmark') ] })
                ]
              })
            ]
          }),

          s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__item'), arr.has('tox-collection__group-heading') ],
                children: [ s.text(str.is('Example Separator')) ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    children: [
                      s.element('p', { html: str.is('Paragraph') })
                    ]
                  }),
                  s.element('div', { classes: [ arr.has('tox-collection__item-checkmark') ] })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    children: [
                      s.element('blockquote', { html: str.is('Blockquote') })
                    ]
                  }),
                  s.element('div', { classes: [ arr.has('tox-collection__item-checkmark') ] })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    children: [
                      s.element('pre', { html: str.is('Code') })
                    ]
                  }),
                  s.element('div', { classes: [ arr.has('tox-collection__item-checkmark') ] })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    html: str.is('Others')
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-caret') ]
                  })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    children: [
                      s.element('span', {
                        html: str.is('Red text'),
                        styles: {
                          color: str.is('rgb(255, 0, 0)')
                        }
                      })
                    ]
                  }),
                  s.element('div', { classes: [ arr.has('tox-collection__item-checkmark') ] })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    children: [
                      s.element('p', {
                        html: str.is('Red paragraph'),
                        styles: {
                          color: str.is('rgb(255, 0, 0)')
                        }
                      })
                    ]
                  }),
                  s.element('div', { classes: [ arr.has('tox-collection__item-checkmark') ] })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    children: [
                      s.element('div', { html: str.is('Table row 1') })
                    ]
                  }),
                  s.element('div', { classes: [ arr.has('tox-collection__item-checkmark') ] })
                ]
              })
            ]
          })
        ]
      })),
      menu
    );

    await FocusTools.pTryOnSelector('Focus should be on Title', doc, '.tox-collection__item:contains(Title)');
    TinyUiActions.keydown(editor, Keys.down());
    await FocusTools.pTryOnSelector('Focus should be on Main heading', doc, '.tox-collection__item:contains(Main heading)');
    TinyUiActions.keydown(editor, Keys.down());
    await FocusTools.pTryOnSelector('Focus should be on Sub heading', doc, '.tox-collection__item:contains(Sub heading)');
    TinyUiActions.keydown(editor, Keys.down());
    await FocusTools.pTryOnSelector('Focus should be on Paragraph', doc, '.tox-collection__item:contains(Paragraph)');
  });
});
