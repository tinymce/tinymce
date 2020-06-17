import { ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Log, Pipeline, Step, UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Body, Element } from '@ephox/sugar';

import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('OxideFontFormatMenuTest', (success, failure) => {
  const isIE = PlatformDetection.detect().browser.isIE();
  Theme();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const doc = Element.fromDom(document);

      const apis = TinyApis(editor);
      const tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Log.step('TBA', 'Check structure of font format', GeneralSteps.sequence([
          Step.label('Add styles to the editor', TestHelpers.GuiSetup.mAddStyles(doc, [
            ':focus { background-color: rgb(222, 224, 226); }',
            '.tox-collection__item-label > * { margin: 0px; }'
          ])),

          Step.label('Set editor content', apis.sSetContent('<blockquote>Text</blockquote>')),
          Step.label('Set cursor position', apis.sSetCursor([ 0, 0 ], 'Te'.length)),

          tinyUi.sClickOnToolbar('Click on the style select button', 'button'),
          Step.label('Wait for the style select menu', UiFinder.sWaitForVisible('Waiting for menu', Body.body(), '[role="menu"]')),
          Step.label('Checking menu structure', Chain.asStep(Body.body(), [
            UiFinder.cFindIn('[role="menu"]'),
            Assertions.cAssertStructure(
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
                                  color: (isIE ? str.is('#ff0000') : str.is('rgb(255, 0, 0)'))
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
                                  color: (isIE ? str.is('#ff0000') : str.is('rgb(255, 0, 0)'))
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
              }))
            )
          ])),
          Step.label('Check focus is on "Title"', FocusTools.sTryOnSelector('Focus should be on Title', doc, '.tox-collection__item:contains(Title)')),
          Step.label('Press down arrow', Keyboard.sKeydown(doc, Keys.down(), {})),
          Step.label('Check focus is on "Main heading"', FocusTools.sTryOnSelector('Focus should be on Main heading', doc, '.tox-collection__item:contains(Main heading)')),
          Step.label('Press down arrow (again)', Keyboard.sKeydown(doc, Keys.down(), {})),
          Step.label('Check focus is on "Sub heading"', FocusTools.sTryOnSelector('Focus should be on Sub heading', doc, '.tox-collection__item:contains(Sub heading)')),
          Step.label('Press down arrow (3rd time)', Keyboard.sKeydown(doc, Keys.down(), {})),
          Step.label('Check focus is on "Paragraph"', FocusTools.sTryOnSelector('Focus should be on Paragraph', doc, '.tox-collection__item:contains(Paragraph)')),
          Step.label('Remove styles', TestHelpers.GuiSetup.mRemoveStyles)
        ]))
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: true,
      toolbar: 'styleselect',
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
      ],
      base_url: '/project/tinymce/js/tinymce',
      setup: (_ed) => {

      }
    },
    () => {
      success();
    },
    failure
  );
});
