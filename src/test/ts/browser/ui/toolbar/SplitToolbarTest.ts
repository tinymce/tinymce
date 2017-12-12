import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Button from 'ephox/alloy/api/ui/Button';
import SplitToolbar from 'ephox/alloy/api/ui/SplitToolbar';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import PhantomSkipper from 'ephox/alloy/test/PhantomSkipper';
import TestPartialToolbarGroup from 'ephox/alloy/test/toolbar/TestPartialToolbarGroup';
import { Arr } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('SplitToolbarTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  // Tests requiring 'flex' do not currently work on phantom. Use the remote to see how it is
  // viewed as an invalid value.
  if (PhantomSkipper.skip()) return success();

  GuiSetup.setup(function (store, doc, body) {
    var pPrimary = SplitToolbar.parts().primary({
      dom: {
        tag: 'div',
        classes: [ 'test-toolbar-primary' ]
      },
      shell: true
    });

    var pOverflow = SplitToolbar.parts().overflow({
      dom: {
        tag: 'div',
        classes: [ 'test-toolbar-overflow' ]
      },
      shell: true
    });

    return GuiFactory.build(
      SplitToolbar.sketch({
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
          growingClass: 'test-sliding-height-growing'
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
          }
        }
      })
    );

  }, function (doc, body, gui, component, store) {

    var makeButton = function (itemSpec) {
      return Button.sketch({
        dom: {
          tag: 'button',
          innerHtml: itemSpec.text
        }
      });
    };

    var sResetWidth = function (px) {
      return Step.sync(function () {
        Css.set(component.element(), 'width', px);
        SplitToolbar.refresh(component);
      });
    };

    var group1 = ApproxStructure.build(function (s, str, arr) {
      return s.element('div', {
        classes: [ arr.has('test-toolbar-group') ],
        children: [
          s.element('button', { html: str.is('A') }),
          s.element('button', { html: str.is('B') })
        ]
      });
    });

    var group2 = ApproxStructure.build(function (s, str, arr) {
      return s.element('div', {
        classes: [ arr.has('test-toolbar-group') ],
        children: [
          s.element('button', { html: str.is('C') }),
          s.element('button', { html: str.is('D') })
        ]
      });
    });

    var group3 = ApproxStructure.build(function (s, str, arr) {
      return s.element('div', {
        classes: [ arr.has('test-toolbar-group') ],
        children: [
          s.element('button', { html: str.is('E') }),
          s.element('button', { html: str.is('F') }),
          s.element('button', { html: str.is('G') })
        ]
      });
    });

    var oGroup = ApproxStructure.build(function (s, str, arr) {
      return s.element('div', {
        classes: [ arr.has('test-toolbar-group') ],
        children: [
          s.element('button', { html: str.is('+') })
        ]
      });
    });

    var sAssertGroups = function (label, pGroups, oGroups) {
      return Assertions.sAssertStructure(
        label,
        ApproxStructure.build(function (s, str, arr) {
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

      Step.sync(function () {
        var groups = TestPartialToolbarGroup.createGroups([
          { items: Arr.map([ { text: 'A' }, { text: 'B' } ], makeButton) },
          { items: Arr.map([ { text: 'C' }, { text: 'D' } ], makeButton) },
          { items: Arr.map([ { text: 'E' }, { text: 'F' }, { text: 'G' } ], makeButton) }
        ]);
        SplitToolbar.setGroups(component, groups);
      }),

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

      // TODO: Add testing for sliding?
      GuiSetup.mRemoveStyles
    ];
  }, function () { success(); }, failure);
});

