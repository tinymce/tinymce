import { FocusTools, Keyboard, Keys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as NavigationUtils from 'ephox/alloy/test/NavigationUtils';

UnitTest.asynctest('Matrix Keying Test', (success, failure) => {

  const cells = [
    'c01', 'c02', 'c03', 'c04', 'c05', 'c06',
    'c07', 'c08', 'c09', 'c10', 'c11', 'c12',
    'c13', 'c14', 'c15', 'c16', 'c17', 'c18',
    'c19', 'c20', 'c21'
  ];

  GuiSetup.setup((store, _doc, _body) => {
    const rows = Arr.chunk(cells, 6);

    const item = (classes: string[]) => Container.sketch({
      dom: {
        tag: 'span',
        styles: {
          display: 'inline-block',
          width: '20px',
          height: '20px',
          margin: '1px',
          border: '1px solid black'
        },
        classes: [ 'cell' ].concat(classes)
      },
      events: AlloyEvents.derive([
        AlloyEvents.runOnExecute(
          store.adder('item.execute: ' + classes.join(','))
        )
      ]),
      containerBehaviours: Behaviour.derive([
        Focusing.config({ })
      ])
    });

    return GuiFactory.build(
      Container.sketch({
        dom: {
          classes: [ 'matrix-keying-test' ],
          styles: {
            background: 'white',
            width: '150px',
            height: '200px'
          }
        },
        uid: 'custom-uid',
        containerBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'matrix',
            selectors: {
              row: '.row',
              cell: '.cell'
            }
          })
        ]),
        // 4 x 6 grid size
        components: Arr.map(rows, (row) => Container.sketch({
          dom: {
            tag: 'span',
            classes: [ 'row' ]
          },
          components: Arr.map(row, (c) => item([ c ]))
        }))
      })
    );

  }, (doc, body, gui, _component, store) => {

    const targets: any = Objects.wrapAll(
      Arr.map(cells, (sq) => ({
        key: sq,
        value: {
          label: sq,
          selector: '.' + sq
        }
      }))
    );

    return [
      GuiSetup.mSetupKeyLogger(body),
      FocusTools.sSetFocus('Initial focus', gui.element, '.c11'),
      NavigationUtils.sequence(
        doc,
        Keys.down(),
        {},
        [
          targets.c17,
          targets.c21,
          targets.c03,
          targets.c09,
          targets.c15,
          targets.c21,
          targets.c03
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.left(),
        { },
        [
          targets.c02,
          targets.c01,
          targets.c06,
          targets.c05,
          targets.c04,
          targets.c03,
          targets.c02,
          targets.c01,
          targets.c06
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.up(),
        { },
        [
          targets.c21,
          targets.c15,
          targets.c09,
          targets.c03,
          targets.c21,
          targets.c15,
          targets.c09,
          targets.c03,
          targets.c21
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.right(),
        { },
        [
          targets.c19,
          targets.c20,
          targets.c21,
          targets.c19,
          targets.c20,
          targets.c21
        ]
      ),

      NavigationUtils.sequence(
        doc,
        Keys.left(),
        { },
        [
          targets.c20,
          targets.c19,
          targets.c21,
          targets.c20,
          targets.c19,
          targets.c21
        ]
      ),

      // Test execute
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      store.sAssertEq(
        'Execute should have c21',
        [ 'item.execute: c21' ]
      ),

      GuiSetup.mTeardownKeyLogger(body, [ ])
    ];
  }, success, failure);
});
