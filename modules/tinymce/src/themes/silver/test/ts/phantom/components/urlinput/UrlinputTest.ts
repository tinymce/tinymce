import { Assertions, Keyboard, Keys, Logger, Mouse, Step, UiFinder, Waiter, ApproxStructure, Chain, UiControls } from '@ephox/agar';
import { AlloyTriggers, Focusing, GuiFactory, NativeEvents, Representing, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { Future, Option } from '@ephox/katamari';
import { Element, SelectorFind, Value } from '@ephox/sugar';

import { UrlData } from 'tinymce/themes/silver/backstage/UrlInputBackstage';
import { LinkTargetType } from 'tinymce/themes/silver/ui/core/LinkTargets';
import { renderUrlInput } from 'tinymce/themes/silver/ui/dialog/UrlInput';

import TestExtras from '../../../module/TestExtras';
import { DisablingSteps } from '../../../module/DisablingSteps';

UnitTest.asynctest('UrlInput component Test', (success, failure) => {
  const helpers = TestExtras();
  const sink = Element.fromDom(document.querySelector('.mce-silver-sink'));

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderUrlInput({
          label: Option.some('UrlInput label'),
          name: 'col1',
          filetype: 'file',
          disabled: false
        }, helpers.backstage, {
          getHistory: (fileType) => [],
          addToHistory: (url, filetype) => store.adder('addToHistory')(),
          getLinkInformation: () => Option.some({
            targets: [
              {
                type: 'header' as LinkTargetType,
                title: 'Header1',
                url: '#header',
                level: 0,
                attach: store.adder('header1.attach')
              },
              {
                type: 'header' as LinkTargetType,
                title: 'Header2',
                url: '#h_2abefd32',
                level: 0,
                attach: store.adder('header2.attach')
              }
            ],
            anchorTop: '#anchor-top',
            anchorBottom: undefined
          }),
          getValidationHandler: () => Option.none(),
          getUrlPicker: (filetype) => Option.some((entry: UrlData) => {
            store.adder('urlpicker')();
            return Future.pure({ value: 'http://tiny.cloud', meta: { before: entry.value } });
          })
        })
      );
    },
    (doc, body, gui, component, store) => {

      const input = component.getSystem().getByDom(
        SelectorFind.descendant(component.element(), 'input').getOrDie(
          'Could not find input'
        )
      ).getOrDie();

      return [
        TestHelpers.GuiSetup.mAddStyles(doc, [
          '.tox-menu { background: white; }',
          '.tox-collection__item--active { background: #cadbee }'
        ]),

        // Disabling state
        DisablingSteps.sAssertDisabled('Initial disabled state', false, component),
        DisablingSteps.sSetDisabled('set disabled', component, true),
        DisablingSteps.sAssertDisabled('enabled > disabled', true, component),
        DisablingSteps.sSetDisabled('set enabled', component, false),
        DisablingSteps.sAssertDisabled('disabled > enabled', false, component),

        Step.sync(() => {
          Focusing.focus(input);
        }),
        Keyboard.sKeydown(doc, Keys.down(), { }),

        Waiter.sTryUntil(
          'Waiting for menu to appear',
          UiFinder.sExists(
            sink,
            '.tox-menu .tox-collection__item'
          ),
          100,
          4000
        ),

        Chain.asStep(sink, [
          UiFinder.cFindIn('[role="menu"]'),
          Assertions.cAssertStructure(
            'Checking structure of menu (especially text)',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                classes: [ arr.has('tox-menu'), arr.has('tox-collection--list'), arr.has('tox-collection') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__group') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item')],
                        children: [
                          s.element('div', { html: str.is('Header1') })
                        ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item')],
                        children: [
                          s.element('div', { html: str.is('Header2') })
                        ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-collection__group') ],
                    children: [
                      s.element('div', {
                        children: [
                          s.element('div', { html: str.is('&lt;top&gt;') })
                        ]
                      })
                    ]
                  })
                ]
              });
            })
          )
        ]),

        UiControls.sSetValue(input.element(), 'He'),
        Step.sync(() => {
          AlloyTriggers.emit(input, NativeEvents.input());
        }),
        Waiter.sTryUntil(
          'Waiting for the menu to update',
          Chain.asStep(sink, [
            UiFinder.cFindAllIn('.tox-collection__item'),
            Chain.op((menuItems) => {
              if (menuItems.length > 2) {
                throw Error('Menu hasn\'t been updated yet');
              }
            })
          ]),
          100,
          3000
        ),
        Chain.asStep(sink, [
          UiFinder.cFindIn('[role="menu"]'),
          Assertions.cAssertStructure(
            'Checking the menu shows items that match the input string',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                classes: [ arr.has('tox-menu'), arr.has('tox-collection--list'), arr.has('tox-collection') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__group') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item')],
                        children: [
                          s.element('div', { html: str.is('Header1') })
                        ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item')],
                        children: [
                          s.element('div', { html: str.is('Header2') })
                        ]
                      })
                    ]
                  })
                ]
              });
            })
          )
        ]),

        store.sAssertEq('nothing in store ... before selecting item', []),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Step.sync(() => {
          Assertions.assertEq('Checking Value.get', '#header', Value.get(input.element()));
          const repValue = Representing.getValue(input);
          Assertions.assertEq('Checking Rep.getValue',
            {
              value: '#header',
              meta: { text: 'Header1' }
            },
            {
              value: repValue.value,
              meta: { text: repValue.meta.text }
            }
          );
        }),

        store.sAssertEq('addToHistory called ... before firing attach', [ 'addToHistory' ]),
        Logger.t(
          'Check that attach fires',
          Step.sync(() => {
            const repValue = Representing.getValue(input);
            repValue.meta.attach();
          })
        ),
        store.sAssertEq('Attach should be in store ... after firing attach', [ 'addToHistory' , 'header1.attach' ]),

        Mouse.sClickOn(component.element(), 'button'),

        store.sAssertEq(
          'URL picker should have been opened ... after clicking button',
          [ 'addToHistory' , 'header1.attach', 'urlpicker' ]
        ),

        Waiter.sTryUntilPredicate('Checking Value.get', () => {
          return 'http://tiny.cloud' === Value.get(input.element());
        }, 100, 4000),

        Step.sync(() => {
          const repValue = Representing.getValue(input);
          Assertions.assertEq('Checking Rep.getValue', {
            value: 'http://tiny.cloud',
            meta: { before: '#header'}
          }, repValue);
        }),

        TestHelpers.GuiSetup.mRemoveStyles
      ];
    }, () => {
      helpers.destroy();
      success();
    },
    failure
  );
});
