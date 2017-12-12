import { FocusTools } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Step } from '@ephox/agar';
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
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Flat Grid Keying Test', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var squares = [
    's01', 's02', 's03', 's04', 's05', 's06',
    's07', 's08', 's09', 's10', 's11', 's12',
    's13', 's14', 's15', 's16', 's17', 's18',
    's19', 's20', 's21'
  ];

  GuiSetup.setup(function (store, doc, body) {
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
          classes: [ 'square' ].concat(classes)
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
          tag: 'div',
          classes: [ 'flat-grid-keying-test'],
          styles: {
            background: 'white',
            width: '150px',
            height: '200px'
          }
        },
        uid: 'custom-uid',
        containerBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'flatgrid',
            selector: '.square',
            initSize: {
              numColumns: 1,
              numRows: 1
            }
          })
        ]),
        // 4 x 6 grid size
        components: Arr.map(squares, function (num) {
          return item([ num ]);
        })
      })
    );

  }, function (doc, body, gui, component, store) {

    var targets = Objects.wrapAll(
      Arr.map(squares, function (sq) {
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
      FocusTools.sSetFocus('Initial focus', gui.element(), '.s11'),
      Step.sync(function () {
        Keying.setGridSize(component, 4, 6);
      }),
      NavigationUtils.sequence(
        doc,
        Keys.down(),
        { },
        [
          targets.s17,
          targets.s21,
          targets.s03,
          targets.s09,
          targets.s15,
          targets.s21,
          targets.s03
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.left(),
        { },
        [
          targets.s02,
          targets.s01,
          targets.s06,
          targets.s05,
          targets.s04,
          targets.s03,
          targets.s02,
          targets.s01,
          targets.s06
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.up(),
        { },
        [
          targets.s21,
          targets.s15,
          targets.s09,
          targets.s03,
          targets.s21,
          targets.s15,
          targets.s09,
          targets.s03,
          targets.s21
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.right(),
        { },
        [
          targets.s19,
          targets.s20,
          targets.s21,
          targets.s19,
          targets.s20,
          targets.s21
        ]
      ),

      NavigationUtils.sequence(
        doc,
        Keys.left(),
        { },
        [
          targets.s20,
          targets.s19,
          targets.s21,
          targets.s20,
          targets.s19,
          targets.s21
        ]
      ),

      // Test execute
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      store.sAssertEq(
        'Execute should have s21',
        [ 'item.execute: s21' ]
      ),
      GuiSetup.mTeardownKeyLogger(body, [ ])
    ];
  }, function () {
    success();
  }, failure);
});

