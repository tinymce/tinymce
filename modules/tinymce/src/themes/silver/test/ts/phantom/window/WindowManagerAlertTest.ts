import {
  ApproxStructure,
  Assertions,
  FocusTools,
  GeneralSteps,
  Logger,
  Mouse,
  Pipeline,
  Step,
  UiFinder,
  Waiter,
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { Body, Element as SugarElement, Element } from '@ephox/sugar';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:alert Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);
  const sink = document.querySelector('.mce-silver-sink');

  const sTeardown = GeneralSteps.sequence([
    Mouse.sClickOn(Body.body(), '.tox-button--icon[aria-label="Close"]'),
    Waiter.sTryUntil(
      'Waiting for blocker to disappear after clicking close',
      UiFinder.sNotExists(Body.body(), '.tox-dialog-wrap'),
      100,
      1000
    ),
  ]);

  const sHasBasicStructure = (label) => {
    return GeneralSteps.sequence([
      sCreateAlert(label, Fun.noop),
      sWaitForDialog,
      Step.sync(() => {
        Assertions.assertStructure('A basic alert dialog should have these components',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('mce-silver-sink') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-dialog-wrap') ],
                  children: [
                    s.element('div', { classes: [ arr.has('tox-dialog-wrap__backdrop') ] }),
                    s.element('div', {
                      classes: [ arr.has('tox-dialog') ],
                      children: [
                        s.element('div', {
                          classes: [ arr.has('tox-dialog__header') ],
                          styles: {
                            display: str.is('none')
                          },
                          children: [
                            s.element('div', {
                              classes: [ arr.has('tox-dialog__title') ],
                              styles: {
                                display: str.is('none')
                              },
                              html: str.is('')
                            }),
                            s.element('button', {
                              classes: [
                                arr.has('tox-button'),
                                arr.has('tox-button--icon'),
                                arr.has('tox-button--naked')
                              ],
                              attrs: {
                                'aria-label': str.is('Close'),
                                'data-alloy-tabstop': str.is('true'),
                                'type': str.is('button')
                              },
                              html: str.is('')
                            })
                          ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-dialog__body')],
                          children: [
                            s.element('div', {
                              classes: [ arr.has('tox-dialog__body-content')],
                              children: [
                                s.element('p', {})
                              ]
                            })
                          ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-dialog__footer') ],
                          children: [
                            s.element('div', {
                              classes: [ arr.has('tox-dialog__footer-start') ],
                              attrs: {
                                role: str.is('presentation')
                              }
                            }),
                            s.element('div', {
                              classes: [ arr.has('tox-dialog__footer-end') ],
                              attrs: {
                                role: str.is('presentation')
                              },
                              children: [
                                s.element('button', {
                                  html: str.is('OK'),
                                  classes: [
                                    arr.has('tox-button'),
                                  ],
                                  attrs: {
                                    'type': str.is('button'),
                                    'data-alloy-tabstop': str.is('true')
                                  },
                                })
                              ]
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              ]
            });
          }),
          SugarElement.fromDom(sink)
        );
      }),
      sTeardown
    ]);
  };

  const sCreateAlert = (message, callback) => {
    return Step.sync(() => {
      windowManager.alert(message, callback);
    });
  };

  const sWaitForDialog = Waiter.sTryUntil(
    'alert dialog shows',
    UiFinder.sExists(Body.body(), '.tox-dialog__body'),
    100,
    10000
  );

  const sInsertTheCorrectMessage = (label) => {
    return GeneralSteps.sequence([
      sCreateAlert(label, Fun.noop),
      Step.sync(() => {
        const body = document.querySelector('.tox-dialog__body');
        Assertions.assertStructure('A basic alert dialog should have these components',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-dialog__body')],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-dialog__body-content')],
                  children: [
                    s.element('p', {
                      html: str.is(label)
                    })
                  ]
                })
              ]
            });
          }),
          SugarElement.fromDom(body)
        );
      }),
      sTeardown

    ]);
  };

  const sCallbackOnClose = (label) => {
    let calls = 0;

    return GeneralSteps.sequence([
      Step.sync(() => {
        const testCallback = () => {
          calls++;
        };
        windowManager.alert(label, testCallback);
        Assertions.assertEq('callback should not have been called yet', 0, calls);
      }),
      Mouse.sClickOn(Body.body(), '.tox-button--icon[aria-label="Close"]'),
      Waiter.sTryUntil(
        'Waiting for blocker to disappear after clicking close',
        UiFinder.sNotExists(Body.body(), '.tox-dialog-wrap'),
        100,
        1000
      ),
      Step.sync(() => {
        Assertions.assertEq('Clicking on close should call the callback fn once', 1, calls);
      })

    ]);
  };

  const sShouldFocusOnCloseButton = GeneralSteps.sequence([
    sCreateAlert('initial focus should be on Close', Fun.noop),
    FocusTools.sTryOnSelector('When the alert dialog loads, focus should be on the ok button', Element.fromDom(document), 'button:contains(OK)'),
    sTeardown
  ]);

  const sCloseButtonShouldWork = Logger.t(
    'Check that clicking ok in the dialog makes the dialog go away',
    GeneralSteps.sequence([
      sCreateAlert('Showing an alert', Fun.noop),
      Mouse.sClickOn(Body.body(), '.tox-button:contains("OK")'),
      UiFinder.sNotExists(Body.body(), '[role="dialog"]'),
    ])
  );

  Pipeline.async({}, [
    sHasBasicStructure('The alert dialog loads with the basic structure'),
    sInsertTheCorrectMessage('should display this <strong>message</strong>'),
    sCallbackOnClose('The callback should fire when ok is invoked'),
    sShouldFocusOnCloseButton,
    sCloseButtonShouldWork
  ], function () {
    helpers.destroy();
    success();
  }, failure);
});
