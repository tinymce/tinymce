import { FocusTools, GeneralSteps, Keyboard, Keys, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('MenuKeyingTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    const makeItem = function (name) {
      return Container.sketch({
        dom: {
          classes: [ 'test-item', name ],
          innerHtml: name
        },
        containerBehaviours: Behaviour.derive([
          Focusing.config({ })
        ])
      });
    };

    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'div',
          classes: [ 'menu-keying-test'],
          styles: {

          }
        },
        uid: 'custom-uid',
        containerBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'menu',
            selector: '.test-item',
            onRight: store.adderH('detected.right'),
            onLeft:  store.adderH('detected.left'),
            moveOnTab: true
          })
        ]),
        components: [
          makeItem('alpha'),
          makeItem('beta'),
          makeItem('gamma')
        ]
      })
    );

  }, function (doc, body, gui, component, store) {
    const checkStore = function (label, steps, expected) {
      return GeneralSteps.sequence([
        store.sClear
      ].concat(steps).concat([
        store.sAssertEq(label, expected)
      ]));
    };

    return [
      GuiSetup.mSetupKeyLogger(body),
      Step.sync(function () {
        Keying.focusIn(component);
      }),

      FocusTools.sTryOnSelector('Focus should start on alpha', doc, '.alpha'),

      store.sAssertEq('Initially empty', [ ]),

      FocusTools.sTryOnSelector('Focus should still be on alpha', doc, '.alpha'),

      checkStore('pressing tab', [
        Keyboard.sKeydown(doc, Keys.tab(), { })
      ], [ ]),
      FocusTools.sTryOnSelector('Focus should now be on beta', doc, '.beta'),

      checkStore('pressing tab', [
        Keyboard.sKeydown(doc, Keys.tab(), { })
      ], [ ]),

      FocusTools.sTryOnSelector('Focus should now be on gamma', doc, '.gamma'),

      checkStore('pressing tab', [
        Keyboard.sKeydown(doc, Keys.tab(), { shift: true })
      ], [ ]),

      FocusTools.sTryOnSelector('Focus should now be on beta', doc, '.beta'),

      checkStore('pressing up', [
        Keyboard.sKeydown(doc, Keys.up(), { })
      ], [ ]),

      FocusTools.sTryOnSelector('Focus should now be on alpha', doc, '.alpha'),

      checkStore('pressing down', [
        Keyboard.sKeydown(doc, Keys.down(), { })
      ], [ ]),

      FocusTools.sTryOnSelector('Focus should now be on beta', doc, '.beta'),

      checkStore('pressing enter', [
        Keyboard.sKeydown(doc, Keys.enter(), { })
      ], [ ]),

      GuiSetup.mTeardownKeyLogger(body, [ ])
    ];
  }, function () { success(); }, failure);
});
