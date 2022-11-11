import { ApproxStructure, Assertions, GeneralSteps, Step, StructAssert } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Result } from '@ephox/katamari';
import { Css } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { SplitFloatingToolbar } from 'ephox/alloy/api/ui/SplitFloatingToolbar';
import * as Sinks from 'ephox/alloy/test/Sinks';
import * as TestPartialToolbarGroup from 'ephox/alloy/test/toolbar/TestPartialToolbarGroup';

UnitTest.asynctest('SplitFloatingToolbarTest', (success, failure) => {

  const sinkComp = Sinks.relativeSink();

  const anchorButtonMem = Memento.record(Button.sketch({
    dom: {
      tag: 'button',
      classes: [ 'anchor-button' ],
      innerHtml: '-'
    }
  }));

  GuiSetup.setup((store, _doc, _body) => {
    const pPrimary = SplitFloatingToolbar.parts.primary({
      dom: {
        tag: 'div',
        classes: [ 'test-toolbar-primary' ]
      },
      shell: true
    });

    return GuiFactory.build(
      SplitFloatingToolbar.sketch({
        dom: {
          tag: 'div',
          classes: [ 'test-split-toolbar' ],
          styles: {
            width: '400px',
            outline: '2px solid blue'
          }
        },
        lazySink: (_comp) => {
          return Result.value(sinkComp);
        },
        components: [
          pPrimary
        ],

        markers: {
          overflowToggledClass: 'test-more-button-toggled'
        },

        parts: {
          'overflow-group': TestPartialToolbarGroup.munge({
            items: [ ]
          }),
          'overflow-button': {
            dom: {
              tag: 'button',
              classes: [ 'more-button' ],
              innerHtml: '+'
            }
          },
          'overflow': {
            dom: {
              tag: 'div',
              classes: [ 'test-toolbar-overflow' ]
            }
          }
        },
        onOpened: store.adder('onOpened'),
        onClosed: store.adder('onClosed')
      })
    );
  }, (doc, _body, gui, component, store) => {
    gui.add(sinkComp);
    gui.add(GuiFactory.build(anchorButtonMem.asSpec()));

    const makeButton = (itemSpec: { text: string }) => Button.sketch({
      dom: {
        tag: 'button',
        innerHtml: itemSpec.text
      }
    });

    const sResetWidth = (px: string) => Step.sync(() => {
      Css.set(component.element, 'width', px);
      SplitFloatingToolbar.refresh(component);
    });

    const group1 = ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('test-toolbar-group') ],
      children: [
        s.element('button', { html: str.is('A') }),
        s.element('button', { html: str.is('B') })
      ]
    }));

    const group2 = ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('test-toolbar-group') ],
      children: [
        s.element('button', { html: str.is('C') }),
        s.element('button', { html: str.is('D') })
      ]
    }));

    const group3 = ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('test-toolbar-group') ],
      children: [
        s.element('button', { html: str.is('E') }),
        s.element('button', { html: str.is('F') }),
        s.element('button', { html: str.is('G') })
      ]
    }));

    const oGroup = ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('test-toolbar-group') ],
      children: [
        s.element('button', { html: str.is('+') })
      ]
    }));

    const sAssertGroups = (label: string, pGroups: StructAssert[], oGroups: StructAssert[]) => GeneralSteps.sequence([
      Assertions.sAssertStructure(
        label,
        ApproxStructure.build((s, _str, arr) => s.element('div', {
          children: [
            s.element('div', {
              classes: [ arr.has('test-toolbar-primary') ],
              children: pGroups
            })
          ]
        })),
        component.element
      ),
      Assertions.sAssertStructure(
        label,
        ApproxStructure.build((s, str, arr) => s.element('div', {
          children: [
            s.element('div', {
              attrs: {
                id: str.contains('aria-controls')
              },
              children: [
                s.element('div', {
                  classes: [ arr.has('test-toolbar-overflow') ],
                  children: oGroups
                })
              ]
            })
          ]
        })),
        sinkComp.element
      )
    ]);

    const sAssertSplitFloatingToolbarToggleState = (expected: boolean) => Step.sync(() => {
      Assertions.assertEq('Expected split floating toolbar toggle state to be ' + expected, expected, SplitFloatingToolbar.isOpen(component));
    });

    const sToggleSplitFloatingToolbar = () => Step.sync(() => {
      SplitFloatingToolbar.toggle(component);
    });

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-toolbar-group { display: flex; }',
        '.test-split-toolbar > div { display: flex; }',

        '.test-split-toolbar button { width: 100px; }',
        '.test-toolbar-overflow button { width: 100px; }',
        '.test-split-toolbar button.more-button { width: 50px; }'
      ]),

      store.sAssertEq('Assert initial store state', [ ]),
      sAssertSplitFloatingToolbarToggleState(false),

      Step.sync(() => {
        const groups = TestPartialToolbarGroup.createGroups([
          { items: Arr.map([{ text: 'A' }, { text: 'B' }], makeButton) },
          { items: Arr.map([{ text: 'C' }, { text: 'D' }], makeButton) },
          { items: Arr.map([{ text: 'E' }, { text: 'F' }, { text: 'G' }], makeButton) }
        ]);
        SplitFloatingToolbar.setGroups(component, groups);
        SplitFloatingToolbar.toggle(component);
      }),

      store.sAssertEq('Assert store contains toggled state', [ 'onOpened' ]),
      sAssertSplitFloatingToolbarToggleState(true),

      sAssertGroups('width=400px (1 +)', [ group1, oGroup ], [ group2, group3 ]),

      sResetWidth('250px'),

      sAssertGroups('width=300px (1 +)', [ group1, oGroup ], [ group2, group3 ]),

      sResetWidth('249px'),
      sAssertGroups('width=300px (+) (not enough space for the group and the +)', [ oGroup ], [ group1, group2, group3 ]),

      sResetWidth('400px'),
      sAssertGroups('width=400px (1 +)', [ group1, oGroup ], [ group2, group3 ]),

      sResetWidth('450px'),
      sAssertGroups('width=450px (1 +)', [ group1, group2, oGroup ], [ group3 ]),

      sResetWidth('670px'),
      sAssertGroups('width=670px, (1 2 +)', [ group1, group2, oGroup ], [ group3 ]),

      sResetWidth('700px'),
      sAssertGroups('width=700px, (1 2 +)', [ group1, group2, group3 ], [ ]),

      sResetWidth('400px'),
      sAssertGroups('width=400px (1 +)', [ group1, oGroup ], [ group2, group3 ]),

      store.sClear,
      sToggleSplitFloatingToolbar(),
      store.sAssertEq('Assert store contains toggled state', [ 'onClosed' ]),
      sAssertSplitFloatingToolbarToggleState(false),

      sToggleSplitFloatingToolbar(),
      store.sAssertEq('Assert store contains toggled state', [ 'onClosed', 'onOpened' ]),
      sAssertSplitFloatingToolbarToggleState(true),

      GuiSetup.mRemoveStyles
    ];
  }, success, failure);
});
