import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Cursors } from '@ephox/agar';
import { FocusTools } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import Button from 'ephox/alloy/api/ui/Button';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('ButtonSpecTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Button.sketch({
        dom: {
          tag: 'button',
          innerHtml: 'ButtonSpecTest.button',
          classes: [ 'test-button' ]
        },
        action: store.adder('button.action'),
        uid: 'test-button-id'
      })
    );
  }, function (doc, body, gui, component, store) {
    var testStructure = Step.sync(function () {
      Assertions.assertStructure(
        'Checking initial structure of button',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('button', {
            classes: [
              arr.has('test-button')
            ],
            attrs: {
              type: str.is('button'),
              'data-alloy-id': str.is('test-button-id'),
              role: str.is('button')
            },
            html: str.is('ButtonSpecTest.button')
          });
        }),
        component.element()
      );
    });

    var testButtonClick = Logger.t(
      'testing button click',
      GeneralSteps.sequence([
        store.sAssertEq('step 1: no clicks', [ ]),
        Mouse.sClickOn(gui.element(), 'button'),
        store.sAssertEq('step 2: post click', [ 'button.action' ]),
        store.sClear,
        Chain.asStep(gui.element(), [
          UiFinder.cFindIn('button'),
          Cursors.cFollow([ 0 ]),
          Mouse.cClick
        ]),
        store.sAssertEq('step 3: post click on button text', [ 'button.action' ]),
        store.sClear
      ])
    );

    var testExecuting = Logger.t(
      'testing dispatching execute',
      GeneralSteps.sequence([
        Step.sync(function () {
          store.clear();
          store.assertEq('post clear', [ ]);
          AlloyTriggers.emitExecute(component);
          store.assertEq('post execute', [ 'button.action' ]);
          store.clear();
        })
      ])
    );

    var testFocusing = Logger.t(
      'test focusing',
      GeneralSteps.sequence([
        FocusTools.sSetFocus('Setting focus on button', gui.element(), '.test-button'),
        FocusTools.sTryOnSelector('Checking focus on button', doc, '.test-button')
      ])
    );

    var testKeyboard = Logger.t(
      'test keyboard',
      GeneralSteps.sequence([
        store.sAssertEq('pre-enter', [ ]),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('post-enter', [ 'button.action' ]),
        store.sClear
      ])
    );

    return [
      // Test structure
      testStructure,
      // Test clicking
      testButtonClick,

      // Test focusing
      testFocusing,

      // Test keyboard
      testKeyboard,

      // Test executing
      testExecuting
    ];
  }, success, failure);
});

