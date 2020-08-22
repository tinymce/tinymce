import { FocusTools, Pipeline, RealMouse, Step } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarElement } from '@ephox/sugar';

import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('Dialog Focus Test (webdriver)', (success, failure) => {
  const platform = PlatformDetection.detect();
  const isPhantomJs = /PhantomJS/.test(window.navigator.userAgent);

  // This test won't work on PhantomJS or on all Mac OS browsers (webdriver actions appear to be ignored)
  if (isPhantomJs || platform.os.isOSX()) {
    return success();
  }

  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const doc = SugarElement.fromDom(document);

  const tests = [
    TestHelpers.GuiSetup.mAddStyles(doc, [
      '[role="dialog"] { border: 1px solid black; padding: 2em; background-color: rgb(131,193,249); top: 40px; position: absolute; }',

      ':focus { outline: 3px solid green; !important; }'
    ]),

    Step.sync(() => {
      windowManager.open({
        title: 'Custom Dialog',
        body: {
          type: 'panel',
          items: [
            {
              name: 'input1',
              type: 'input'
            }
          ]
        },
        buttons: [
          {
            type: 'cancel',
            text: 'Close'
          }
        ],
        initialData: {
          input1: 'Dog'
        }
      }, { }, Fun.noop);
    }),

    FocusTools.sTryOnSelector(
      'focus should start on input',
      doc,
      '.tox-textfield'
    ),

    RealMouse.sClickOn('body'),

    FocusTools.sTryOnSelector(
      'focus should be on body',
      doc,
      'body'
    ),

    RealMouse.sClickOn('.tox-dialog'),

    FocusTools.sTryOnSelector(
      'focus should move to input after clicking on the dialog',
      doc,
      '.tox-textfield'
    ),

    RealMouse.sClickOn('body'),

    FocusTools.sTryOnSelector(
      'focus should be on body (again)',
      doc,
      'body'
    ),

    RealMouse.sClickOn('.tox-dialog__footer'),

    FocusTools.sTryOnSelector(
      'focus should move to input after clicking on the dialog footer',
      doc,
      '.tox-textfield'
    )
  ];

  Pipeline.async({ }, tests, () => {
    helpers.destroy();
    success();
  }, failure);
});
