import {
  ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Log, Logger, Mouse, Pipeline, UiFinder
} from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { document, navigator } from '@ephox/dom-globals';
import { Arr, Option, Options, Result } from '@ephox/katamari';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Attr, Body, Element } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('OxideCollectionComponentTest', (success, failure) => {
  // TODO TINY-3229 implement collection columns properly
  success();
  return;

  Theme();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);
      const doc = Element.fromDom(document);

      const structureItem = (optText: Option<string>, optIcon: Option<string>) => (s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-collection__item') ],
        children: Options.cat([
          optIcon.map((icon) => s.element('div', {
            classes: [ arr.has('tox-collection__item-icon') ],
            html: str.is(icon)
          })),

          optText.map((text) => s.element('div', {
            classes: [ arr.has('tox-collection__item-label') ],
            html: str.is(text)
          }))
        ])
      });

      const cFindNthIn = (selector, n) => Chain.binder((elem: Element) => {
        const matches = UiFinder.findAllIn(elem, selector);
        return matches.length > 0 && n < matches.length ? Result.value(matches[n]) :
          Result.error(`Could not find match ${n} of selector: ${selector}`);
      });

      Pipeline.async({ }, Logger.ts(
        'Check structure of collection in a dialog',
        [
          TestHelpers.GuiSetup.mAddStyles(doc, [
            ':focus { outline: 2px solid green; }'
          ]),
          tinyUi.sClickOnToolbar('Click on toolbar button', 'button'),
          UiFinder.sWaitForVisible('Waiting for dialog', Body.body(), '[role="dialog"]'),

          FocusTools.sTryOnSelector('Focus should start on input', doc, 'input'),
          Keyboard.sKeydown(doc, Keys.tab(), { }),

          Logger.t(
            'Checking the first collection: columns = 1, list',
            GeneralSteps.sequence([
              Chain.asStep(Body.body(), [
                cFindNthIn('[role="dialog"] .tox-form__group .tox-collection', 0),
                Assertions.cAssertStructure(
                  'Checking structure',
                  ApproxStructure.build((s, str, arr) => s.element('div', {
                    classes: [ arr.has('tox-collection'), arr.has('tox-collection--list'), arr.not('tox-menu') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__group') ],
                        children: Arr.map([ 'A', 'B', 'C' ], (letter) =>
                          structureItem(Option.some('text-' + letter), Option.some('icon-' + letter))(s, str, arr)
                        )
                      })
                    ]
                  }))
                )
              ]),
              FocusTools.sTryOnSelector('Focus should be on A', doc, '.tox-collection__item:contains(A).tox-collection__item--active'),
              Keyboard.sKeydown(doc, Keys.down(), { }),
              FocusTools.sTryOnSelector('Focus should be on B', doc, '.tox-collection__item:contains(B)'),
              Keyboard.sKeydown(doc, Keys.down(), { }),
              FocusTools.sTryOnSelector('Focus should be on C', doc, '.tox-collection__item:contains(C)')
            ])
          ),

          // NOTE: We need a layout engine to use flex-wrap navigation.
          navigator.userAgent.indexOf('PhantomJS') > -1 ?
            FocusTools.sSetFocus('Force focus to F on phantom', Body.body(), '.tox-collection__item:contains("F")')
            : Logger.t(
              'Checking the second collection: columns = auto',
              GeneralSteps.sequence([
                Chain.asStep(Body.body(), [
                  cFindNthIn('[role="dialog"] .tox-form__group .tox-collection', 1),
                  Assertions.cAssertStructure(
                    'Checking structure',
                    ApproxStructure.build((s, str, arr) => s.element('div', {
                      classes: [ arr.has('tox-collection'), arr.has('tox-collection--grid'), arr.not('tox-menu') ],
                      children: [
                        s.element('div', {
                          classes: [ arr.has('tox-collection__group') ],
                          children: Arr.map([ 'D', 'E', 'F' ], (letter) =>
                            structureItem(Option.none(), Option.some('icon-' + letter))(s, str, arr)
                          )
                        })
                      ]
                    }))
                  )
                ]),
                FocusTools.sTryOnSelector('Focus should be on C', doc, '.tox-collection__item:contains(C)'),
                Keyboard.sKeydown(doc, Keys.tab(), { }),
                FocusTools.sTryOnSelector('Focus should be on D', doc, '.tox-collection__item:contains(D)'),
                Keyboard.sKeydown(doc, Keys.right(), { }),
                FocusTools.sTryOnSelector('Focus should be on E', doc, '.tox-collection__item:contains(E)'),
                Keyboard.sKeydown(doc, Keys.right(), { }),
                FocusTools.sTryOnSelector('Focus should be on F', doc, '.tox-collection__item:contains(F)')
              ])
            ),

          Logger.t(
            'Checking the third collection: columns = 2',
            GeneralSteps.sequence([
              Chain.asStep(Body.body(), [
                cFindNthIn('[role="dialog"] .tox-form__group .tox-collection', 2),
                Assertions.cAssertStructure(
                  'Checking structure',
                  ApproxStructure.build((s, str, arr) => s.element('div', {
                    classes: [ arr.has('tox-collection'), arr.has('tox-collection--grid'), arr.not('tox-menu') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__group') ],
                        children: Arr.map([ 'G', 'H' ], (letter) =>
                          structureItem(Option.none(), Option.some('icon-' + letter))(s, str, arr)
                        )
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__group') ],
                        children: Arr.map([ 'I' ], (letter) =>
                          structureItem(Option.none(), Option.some('icon-' + letter))(s, str, arr)
                        )
                      })
                    ]
                  }))
                )
              ]),
              FocusTools.sTryOnSelector('Focus should be on F', doc, '.tox-collection__item:contains(F)'),
              Keyboard.sKeydown(doc, Keys.tab(), { }),
              FocusTools.sTryOnSelector('Focus should be on G', doc, '.tox-collection__item:contains(G)'),
              Keyboard.sKeydown(doc, Keys.right(), { }),
              FocusTools.sTryOnSelector('Focus should be on H', doc, '.tox-collection__item:contains(H)'),
              Keyboard.sKeydown(doc, Keys.down(), { }),
              FocusTools.sTryOnSelector('Focus should be on I', doc, '.tox-collection__item:contains(I)')
            ])
          ),

          Log.stepsAsStep('TBA', 'Check focus follows mouse also', [
            Mouse.sHoverOn(Body.body(), '.tox-collection__item:contains(G)'),
            Chain.asStep(Body.body(), [
              UiFinder.cFindIn('.tox-collection__item--active'),
              Chain.op((activeElem) => {
                const value = Attr.get(activeElem, 'data-collection-item-value');
                Assertions.assertEq('Checking selected value', 'g', value);
              })
            ])
          ]),
          TestHelpers.GuiSetup.mRemoveStyles
        ]
      ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: true,
      toolbar: 'dialog-button',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('dialog-button', {
          type: 'button',
          text: 'Go',
          onAction: () => {
            ed.windowManager.open({
              title: 'Testing list component',
              initialData: {
                'stuff-1': [
                  { value: 'a', text: 'text-A', icon: 'icon-A' },
                  { value: 'b', text: 'text-B', icon: 'icon-B' },
                  { value: 'b', text: 'text-C', icon: 'icon-C' }
                ],

                'stuff-auto': [
                  { value: 'd', text: 'text-D', icon: 'icon-D' },
                  { value: 'e', text: 'text-E', icon: 'icon-E' },
                  { value: 'f', text: 'text-F', icon: 'icon-F' }
                ],

                'stuff-2': [
                  { value: 'g', text: 'text-G', icon: 'icon-G' },
                  { value: 'h', text: 'text-H', icon: 'icon-H' },
                  { value: 'i', text: 'text-I', icon: 'icon-I' }
                ],
                'input1': ''
              },
              body: {
                type: 'panel',
                items: [
                  {
                    name: 'input1',
                    type: 'input'
                  },
                  {
                    name: 'stuff-1',
                    type: 'collection',
                    columns: 1
                  },
                  {
                    name: 'stuff-auto',
                    type: 'collection',
                    columns: 'auto'
                  },
                  {
                    name: 'stuff-2',
                    type: 'collection',
                    columns: 2
                  }
                // TODO TINY-3229 implement collection columns properly
                ] as any[]
              },
              buttons: [ ]
            });
          }
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});
