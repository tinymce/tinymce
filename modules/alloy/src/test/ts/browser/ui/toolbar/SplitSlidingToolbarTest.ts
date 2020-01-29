import { ApproxStructure, Assertions, Step, StructAssert, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { SplitSlidingToolbar } from 'ephox/alloy/api/ui/SplitSlidingToolbar';
import * as PhantomSkipper from 'ephox/alloy/test/PhantomSkipper';
import * as TestPartialToolbarGroup from 'ephox/alloy/test/toolbar/TestPartialToolbarGroup';

UnitTest.asynctest('SplitSlidingToolbarTest', (success, failure) => {
  // Tests requiring 'flex' do not currently work on phantom. Use the remote to see how it is
  // viewed as an invalid value.
  if (PhantomSkipper.skip()) { return success(); }

  GuiSetup.setup((store, doc, body) => {
    const pPrimary = SplitSlidingToolbar.parts().primary({
      dom: {
        tag: 'div',
        classes: [ 'test-toolbar-primary' ]
      },
      shell: true
    });

    const pOverflow = SplitSlidingToolbar.parts().overflow({
      dom: {
        tag: 'div',
        classes: [ 'test-toolbar-overflow' ]
      },
      shell: true
    });

    return GuiFactory.build(
      SplitSlidingToolbar.sketch({
        dom: {
          tag: 'div',
          classes: [ 'test-split-toolbar' ],
          styles: {
            width: '400px',
            outline: '2px solid blue'
          }
        },
        components: [
          pPrimary,
          pOverflow
        ],

        markers: {
          closedClass: 'test-sliding-closed',
          openClass: 'test-sliding-open',
          shrinkingClass: 'test-sliding-height-shrinking',
          growingClass: 'test-sliding-height-growing',
          overflowToggledClass: 'test-more-button-toggled'
        },
        onOpened: store.adder('onOpened'),
        onClosed: store.adder('onClosed'),

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
          }
        }
      })
    );
  }, (doc, body, gui, component, store) => {

    const makeButton = (itemSpec: { text: string }) => {
      return Button.sketch({
        dom: {
          tag: 'button',
          innerHtml: itemSpec.text
        }
      });
    };

    const sResetWidth = (px: string) => {
      return Step.sync(() => {
        Css.set(component.element(), 'width', px);
        SplitSlidingToolbar.refresh(component);
      });
    };

    const group1 = ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        classes: [ arr.has('test-toolbar-group') ],
        children: [
          s.element('button', { html: str.is('A') }),
          s.element('button', { html: str.is('B') })
        ]
      });
    });

    const group2 = ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        classes: [ arr.has('test-toolbar-group') ],
        children: [
          s.element('button', { html: str.is('C') }),
          s.element('button', { html: str.is('D') })
        ]
      });
    });

    const group3 = ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        classes: [ arr.has('test-toolbar-group') ],
        children: [
          s.element('button', { html: str.is('E') }),
          s.element('button', { html: str.is('F') }),
          s.element('button', { html: str.is('G') })
        ]
      });
    });

    const oGroup = ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        classes: [ arr.has('test-toolbar-group') ],
        children: [
          s.element('button', { html: str.is('+') })
        ]
      });
    });

    const sAssertGroups = (label: string, pGroups: StructAssert[], oGroups: StructAssert[]) => {
      return Assertions.sAssertStructure(
        label,
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('div', {
                classes: [ arr.has('test-toolbar-primary') ],
                children: pGroups
              }),
              s.element('div', {
                classes: [ arr.has('test-toolbar-overflow') ],
                children: oGroups
              })
            ]
          });
        }),
        component.element()
      );
    };

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-sliding-closed { visibility: hidden; opacity: 0; }',
        '.test-sliding-open { visibility: visible; opacity: 1 }',
        '.test-sliding-height-growing { transition: height 0.3s ease, opacity 0.2s linear 0.1s; }',
        '.test-sliding-height-shrinking { transition: opacity 0.3s ease, height 0.2s, linear 0.1s, visibility 0s linear 0.3s }',

        '.test-toolbar-group { display: flex; }',
        '.test-split-toolbar > div { display: flex; }',

        '.test-split-toolbar button { width: 100px; }',
        '.test-split-toolbar button.more-button { width: 50px; }'
      ]),

      store.sAssertEq('Assert initial store state', [ ]),

      Step.sync(() => {
        const groups = TestPartialToolbarGroup.createGroups([
          { items: Arr.map([ { text: 'A' }, { text: 'B' } ], makeButton) },
          { items: Arr.map([ { text: 'C' }, { text: 'D' } ], makeButton) },
          { items: Arr.map([ { text: 'E' }, { text: 'F' }, { text: 'G' } ], makeButton) }
        ]);
        SplitSlidingToolbar.setGroups(component, groups);
        SplitSlidingToolbar.toggle(component);
      }),

      Waiter.sTryUntil('Wait for toolbar to be completely open', store.sAssertEq('Assert store contains opened state', [ 'onOpened' ])),
      store.sClear,

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

      Step.sync(() => {
        SplitSlidingToolbar.toggle(component);
      }),
      Waiter.sTryUntil('Wait for toolbar to be completely closed', store.sAssertEq('Assert store contains closed state', [ 'onClosed' ])),

      // TODO: Add testing for sliding?
      GuiSetup.mRemoveStyles
    ];
  }, () => { success(); }, failure);
});
