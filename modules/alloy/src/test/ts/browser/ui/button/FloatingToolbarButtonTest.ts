import { ApproxStructure, Assertions, GeneralSteps, Keyboard, Keys, Log, Mouse, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun, Future, Result } from '@ephox/katamari';
import { SelectorExists } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Behaviour, FloatingToolbarButton, SketchSpec, Tabstopping } from 'ephox/alloy/api/Main';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import * as Layout from 'ephox/alloy/positioning/layout/Layout';
import * as Sinks from 'ephox/alloy/test/Sinks';
import * as TestPartialToolbarGroup from 'ephox/alloy/test/toolbar/TestPartialToolbarGroup';

UnitTest.asynctest('FloatingToolbarButtonTest', (success, failure) => {
  const sinkComp = Sinks.relativeSink();

  const makeButton = (itemSpec: { text: string }): SketchSpec => Button.sketch({
    dom: {
      tag: 'button',
      innerHtml: itemSpec.text
    },
    buttonBehaviours: Behaviour.derive([
      Tabstopping.config({ })
    ])
  });

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    FloatingToolbarButton.sketch({
      layouts: {
        onRtl: () => [ ],
        onLtr: () => [ Layout.southeast, Layout.northeast ]
      },
      lazySink: Fun.constant(Result.value(sinkComp)),
      fetch: () => Future.nu((resolve) => {
        const groups = TestPartialToolbarGroup.createGroups([
          { items: Arr.map([{ text: 'A' }, { text: 'B' }], makeButton) },
          { items: Arr.map([{ text: 'C' }, { text: 'D' }], makeButton) }
        ]);
        resolve(groups);
      }),
      markers: {
        toggledClass: 'test-button-toggle'
      },
      parts: {
        button: {
          dom: {
            tag: 'button',
            classes: [ 'more-button' ],
            innerHtml: '+'
          }
        },
        toolbar: {
          dom: {
            tag: 'div',
            classes: [ 'test-toolbar' ]
          }
        }
      }
    })
  ), (doc, _body, gui, component, _store) => {
    gui.add(sinkComp);

    const sAssertButtonStructure = (active: boolean) => GeneralSteps.sequence([
      Assertions.sAssertStructure(
        `Floating toolbar button should ${active ? 'have' : 'not have'} toggle class`,
        ApproxStructure.build((s, str, arr) => s.element('button', {
          classes: active ? [ arr.has('test-button-toggle') ] : [],
          children: [
            s.text(str.is('+'))
          ]
        })),
        component.element()
      )
    ]);

    const sAssertFloatingToolbarOpened = () => GeneralSteps.sequence([
      Assertions.sAssertStructure(
        'Assert floating toolbar structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          children: [
            s.element('div', {
              attrs: {
                id: str.contains('aria-owns')
              },
              children: [
                s.element('div', {
                  classes: [ arr.has('test-toolbar') ],
                  children: [
                    ApproxStructure.build((s, str, arr) => s.element('div', {
                      classes: [ arr.has('test-toolbar-group') ],
                      children: [
                        s.element('button', { html: str.is('A') }),
                        s.element('button', { html: str.is('B') })
                      ]
                    })),
                    ApproxStructure.build((s, str, arr) => s.element('div', {
                      classes: [ arr.has('test-toolbar-group') ],
                      children: [
                        s.element('button', { html: str.is('C') }),
                        s.element('button', { html: str.is('D') })
                      ]
                    }))
                  ]
                })
              ]
            })
          ]
        })),
        sinkComp.element()
      )
    ]);

    const sAssertFloatingToolbarClosed = () => Step.sync(() => {
      Assertions.assertEq('Floating toolbar should not exist', false, SelectorExists.descendant(sinkComp.element(), 'test-toolbar'));
    });

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-toolbar { display: flex; }'
      ]),

      Log.stepsAsStep('', 'Assert initial structure', [
        sAssertButtonStructure(false),
        sAssertFloatingToolbarClosed()
      ]),

      Log.stepsAsStep('', 'Clicking on button should open floating toolbar', [
        Mouse.sClickOn(gui.element(), 'button'),
        sAssertButtonStructure(true),
        sAssertFloatingToolbarOpened()
      ]),

      Log.stepsAsStep('', 'Escape should close floating toolbar', [
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        sAssertFloatingToolbarClosed()
      ]),

      GuiSetup.mRemoveStyles
    ];
  }, success, failure);
});
