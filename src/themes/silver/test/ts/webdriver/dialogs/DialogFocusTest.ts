import { FocusTools, Pipeline, Step, RealMouse } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document, window } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { TestHelpers } from '@ephox/alloy';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('Dialog Focus Test (webdriver)', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const doc = Element.fromDom(document);

  const isPhantomJs = function () {
    return /PhantomJS/.test(window.navigator.userAgent);
  };

  const tests =
    isPhantomJs ? [ ] : [
      TestHelpers.GuiSetup.mAddStyles(doc, [
        '[role="dialog"] { border: 1px solid black; padding: 2em; background-color: rgb(131,193,249); top: 40px; position: absolute; }',

        ':focus { outline: 3px solid green; !important; }',
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
      ),
    ];

  Pipeline.async({ }, tests, () => {
    helpers.destroy();
    success();
  }, failure);
});