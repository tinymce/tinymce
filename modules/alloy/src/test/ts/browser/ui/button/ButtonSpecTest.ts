import {
  ApproxStructure,
  Assertions,
  Chain,
  Cursors,
  FocusTools,
  GeneralSteps,
  Keyboard,
  Keys,
  Logger,
  Mouse,
  Step,
  UiFinder,
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import { Button } from 'ephox/alloy/api/ui/Button';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as Tagger from 'ephox/alloy/registry/Tagger';

UnitTest.asynctest('ButtonSpecTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
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
  }, (doc, body, gui, component, store) => {
    // TODO: Use s prefix for all of these. Or find out why they aren't.

    const testStructure = Step.sync(() => {
      Assertions.assertStructure(
        'Checking initial structure of button',
        ApproxStructure.build((s, str, arr) => {
          return s.element('button', {
            classes: [
              arr.has('test-button')
            ],
            attrs: {
              'type': str.is('button'),
              'data-alloy-id': str.none()
            },
            html: str.is('ButtonSpecTest.button')
          });
        }),
        component.element()
      );
    });

    const testAlloyUid = Step.sync(() => {
      const actual = Tagger.readOrDie(component.element());
      Assertions.assertEq('Checking alloy uid', 'test-button-id', actual);
    });

    const testButtonClick = Logger.t(
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

    const testExecuting = Logger.t(
      'testing dispatching execute',
      GeneralSteps.sequence([
        Step.sync(() => {
          store.clear();
          store.assertEq('post clear', [ ]);
          AlloyTriggers.emitExecute(component);
          store.assertEq('post execute', [ 'button.action' ]);
          store.clear();
        })
      ])
    );

    const testFocusing = Logger.t(
      'test focusing',
      GeneralSteps.sequence([
        FocusTools.sSetFocus('Setting focus on button', gui.element(), '.test-button'),
        FocusTools.sTryOnSelector('Checking focus on button', doc, '.test-button')
      ])
    );

    const testKeyboard = Logger.t(
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

      // Test alloy uid
      testAlloyUid,

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
