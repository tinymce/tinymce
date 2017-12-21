import { FocusTools } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Focusing from 'ephox/alloy/api/behaviour/Focusing';
import Keying from 'ephox/alloy/api/behaviour/Keying';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import NavigationUtils from 'ephox/alloy/test/NavigationUtils';
import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('Matrix Keying Test', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var cells = [
    'c01', 'c02', 'c03', 'c04', 'c05', 'c06',
    'c07', 'c08', 'c09', 'c10', 'c11', 'c12',
    'c13', 'c14', 'c15', 'c16', 'c17', 'c18',
    'c19', 'c20', 'c21'
  ];

  GuiSetup.setup(function (store, doc, body) {
    var rows = Arr.chunk(cells, 6);

    var item = function (classes) {
      return Container.sketch({
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
    };

    return GuiFactory.build(
      Container.sketch({
        dom: {
          classes: [ 'matrix-keying-test'],
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
        components: Arr.map(rows, function (row) {
          return Container.sketch({
            dom: {
              tag: 'span',
              classes: [ 'row' ]
            },
            components: Arr.map(row, function (c) {
              return item([ c ]);
            })
          });
        })
      })
    );

  }, function (doc, body, gui, component, store) {

    var targets = Objects.wrapAll(
      Arr.map(cells, function (sq) {
        return {
          key: sq,
          value: {
            label: sq,
            selector: '.' + sq
          }
        };
      })
    );

    return [
      GuiSetup.mSetupKeyLogger(body),
      FocusTools.sSetFocus('Initial focus', gui.element(), '.c11'),
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
  }, function () {
    success();
  }, failure);
});

