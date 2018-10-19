import {
  ApproxStructure,
  Assertions,
  Chain,
  FocusTools,
  Keyboard,
  Keys,
  Logger,
  Mouse,
  Pipeline,
  UiFinder,
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';

import Theme from '../../../../../silver/main/ts/Theme';
import { GuiSetup } from '../../module/AlloyTestUtils';

UnitTest.asynctest('OxideFontFormatMenuTest', (success, failure) => {
  Theme();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const doc = Element.fromDom(document);

      const apis = TinyApis(editor);

      Pipeline.async({ }, Logger.ts(
        'Check structure of font format',
        [
          GuiSetup.mAddStyles(doc, [
            ':focus { background-color: rgb(222, 224, 226); }',
            '.tox-collection__item-label > * { margin: 0px; }'
          ]),

          apis.sSetContent('<blockquote>Text</blockquote>'),
          apis.sSetCursor([ 0, 0 ], 'Te'.length),

          Mouse.sClickOn(Body.body(), '.tox-toolbar button'),
          UiFinder.sWaitForVisible('Waiting for menu', Body.body(), '[role="menu"]'),
          Chain.asStep(Body.body(), [
            UiFinder.cFindIn('[role="menu"]'),
            Assertions.cAssertStructure(
              'Checking structure',
              ApproxStructure.build((s, str, arr) => {
                return s.element('div', {
                  classes: [ arr.has('tox-menu'), arr.has('tox-collection'), arr.has('tox-collection--list') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-collection__group') ],
                      children: [
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          children: [
                            s.element('span', { classes: [ arr.has('tox-collection__item-icon') ]}),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-label') ],
                              children: [
                                s.element('h1', { html: str.is('Title') })
                              ]
                            })
                          ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          children: [
                            s.element('span', { classes: [ arr.has('tox-collection__item-icon') ]}),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-label') ],
                              children: [
                                s.element('h2', { html: str.is('Main heading') })
                              ]
                            })
                          ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          children: [
                            s.element('span', { classes: [ arr.has('tox-collection__item-icon') ]}),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-label') ],
                              children: [
                                s.element('h3', { html: str.is('Sub heading') })
                              ]
                            })
                          ]
                        })
                      ]
                    }),

                    s.element('div', {
                      classes: [ arr.has('tox-collection__group') ],
                      children: [
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          children: [
                            s.element('span', { classes: [ arr.has('tox-collection__item-icon') ]}),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-label') ],
                              children: [
                                s.element('p', { html: str.is('Paragraph') })
                              ]
                            })
                          ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          children: [
                            s.element('span', { classes: [ arr.has('tox-collection__item-icon') ]}),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-label') ],
                              children: [
                                s.element('blockquote', { html: str.is('Blockquote') })
                              ]
                            })
                          ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          children: [
                            s.element('span', { classes: [ arr.has('tox-collection__item-icon') ]}),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-label') ],
                              children: [
                                s.element('pre', { html: str.is('Code') })
                              ]
                            })
                          ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          children: [
                            s.element('span', { classes: [ arr.has('tox-collection__item-icon') ]}),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-label') ],
                              html: str.is('Others')
                            }),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-caret') ]
                            })
                          ]
                        })
                      ]
                    })
                  ],
                });
              })
            )
          ]),
          FocusTools.sTryOnSelector('Focus should be on Title', doc, '.tox-collection__item:contains(Title)'),
          Keyboard.sKeydown(doc, Keys.down(), { }),
          FocusTools.sTryOnSelector('Focus should be on Main heading', doc, '.tox-collection__item:contains(Main heading)'),
          Keyboard.sKeydown(doc, Keys.down(), { }),
          FocusTools.sTryOnSelector('Focus should be on Sub heading', doc, '.tox-collection__item:contains(Sub heading)'),
          Keyboard.sKeydown(doc, Keys.down(), { }),
          FocusTools.sTryOnSelector('Focus should be on Paragraph', doc, '.tox-collection__item:contains(Paragraph)'),
          GuiSetup.mRemoveStyles
        ]
      ), onSuccess, onFailure);
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
            { title: 'Other1', format: 'bold' },
          ]
        }
      ],
      skin_url: '/project/js/tinymce/skins/oxide',
      setup: (ed) => {

      }
    },
    () => {
      success();
    },
    failure
  );
});