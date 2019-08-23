import { FocusTools, Pipeline, RealKeys, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { Class, Element, Focus } from '@ephox/sugar';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import Env from 'tinymce/core/api/Env';
import { TestHelpers } from '@ephox/alloy';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('IFrame Dialog Test (webdriver)', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const doc = Element.fromDom(document);

  const tests = (Env.ie > 0 || Env.webkit || Env.gecko) ? [] :
    [
      TestHelpers.GuiSetup.mAddStyles(doc, [
        '[role="dialog"] { border: 1px solid black; padding: 2em; background-color: rgb(131,193,249); top: 40px; position: absolute; }',

        ':focus { outline: 3px solid green; !important; }',
        // NOTE: this is just for aiding debugging. It only works in some browsers
        'iframe:focus-within { outline: 3px solid green; !important; }'
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
              },
              {
                name: 'frame1',
                type: 'iframe'
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
            input1: 'Dog',
            // NOTE: Tried some postMessage stuff to broadcast the scroll. Couldn't get it to work.
            // We can't just read the scroll value due to permissions
            frame1: '<!doctype html><html><head>' +
              '</head>' +
              '<body><h1>Heading</h1>' +
              Arr.map([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ], (n) => {
                return '<p>This is paragraph: ' + n + '</p>';
              }).join('\n') +
            '</body>'
          }
        }, { }, Fun.noop);
      }),

      RealKeys.sSendKeysOn(
        'input',
        [
          RealKeys.text('\u0009')
        ]
      ),
      FocusTools.sTryOnSelector(
        'focus should be on iframe',
        doc,
        'iframe'
      ),

      Step.wait(500),

      RealKeys.sSendKeysOn(
        'iframe => body',
        [
          RealKeys.text('\uE015')
        ]
      ),

      RealKeys.sSendKeysOn(
        'iframe => body',
        [
          RealKeys.text('\u0009')
        ]
      ),

      FocusTools.sTryOnSelector(
        'focus should be on button (cancel)',
        doc,
        'button:contains("cancel")'
      ),

      // Tag it for using with selenium. Note, I should just
      // implement the automatic id tagging in agar, and
      // pass in a DOM reference (or assume focused element)
      Step.sync(() => {
        Focus.active().each((button) => {
          Class.add(button, 'cancel-button');
        });
      }),

      RealKeys.sSendKeysOn(
        '.cancel-button',
        [
          RealKeys.combo( { shiftKey: true }, '\u0009')
        ]
      ),

      FocusTools.sTryOnSelector(
        'focus should move back to iframe (button >> iframe)',
        doc,
        'iframe'
      ),

      RealKeys.sSendKeysOn(
        'iframe => body',
        [
          RealKeys.combo({ shiftKey: true }, '\u0009')
        ]
      ),

      FocusTools.sTryOnSelector(
        'focus should move back to input (iframe >> input)',
        doc,
        'input'
      )
    ];

  Pipeline.async({ }, tests, () => {
    helpers.destroy();
    success();
  }, failure);
});
