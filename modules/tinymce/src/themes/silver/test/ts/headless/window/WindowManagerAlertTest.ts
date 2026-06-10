import { ApproxStructure, Assertions, FocusTools, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, SelectorFind, SugarBody, SugarDocument, TextContent } from '@ephox/sugar';
import { assert } from 'chai';

import type { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.window.WindowManagerAlertTest', () => {
  const extrasHook = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  before(() => {
    windowManager = WindowManager.setup(extrasHook.access().extras);
  });

  const pTeardown = async () => {
    Mouse.clickOn(SugarBody.body(), '.tox-button--icon[aria-label="Close"]');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
  };

  const createAlert = (message: string, callback: () => void) => {
    windowManager.alert(message, callback);
  };

  const pWaitForDialog = () => Waiter.pTryUntil(
    'alert dialog shows',
    () => UiFinder.exists(SugarBody.body(), '.tox-dialog__body')
  );

  // TODO TINY-10480: Investigate flaky tests
  it.skip('Check the basic structure of the alert dialog', async () => {
    createAlert('The alert dialog loads with the basic structure', Fun.noop);
    await pWaitForDialog();
    const sink = extrasHook.access().getDialogSink();
    Assertions.assertStructure('A basic alert dialog should have these components',
      ApproxStructure.build((s, str, arr) => s.element('div', {
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
                      s.element('h1', {
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
                    classes: [ arr.has('tox-dialog__body') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-dialog__body-content') ],
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
                              arr.has('tox-button')
                            ],
                            attrs: {
                              'type': str.is('button'),
                              'data-alloy-tabstop': str.is('true')
                            }
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
      })),
      sink
    );
    await pTeardown();
  });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('Should display a HTML error message', async () => {
    const label = 'should display this <strong>message</strong>';
    createAlert(label, Fun.noop);
    const dialogBody = SelectorFind.descendant(SugarDocument.getDocument(), '.tox-dialog__body').getOrDie('Cannot find dialog body element');
    Assertions.assertStructure('A basic alert dialog should have these components',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-dialog__body') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-dialog__body-content') ],
            children: [
              s.element('p', {
                html: str.is(label)
              })
            ]
          })
        ]
      })),
      dialogBody
    );
    await pTeardown();
  });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('The callback should fire when ok is invoked', async () => {
    let calls = 0;
    const testCallback = () => {
      calls++;
    };
    windowManager.alert('alert', testCallback);
    assert.equal(calls, 0, 'callback should not have been called yet');
    Mouse.clickOn(SugarBody.body(), '.tox-button--icon[aria-label="Close"]');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
    assert.equal(calls, 1, 'Clicking on close should call the callback fn once');
  });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('Should focus on the ok button initially', async () => {
    createAlert('initial focus should be on ok button', Fun.noop);
    FocusTools.sTryOnSelector('When the alert dialog loads, focus should be on the ok button', SugarDocument.getDocument(), 'button:contains(OK)');
    await pTeardown();
  });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('Should focus the first button when the dialog is clicked', async () => {
    createAlert('Click should focus ok button', Fun.noop);
    await FocusTools.pTryOnSelector('When the alert dialog loads, focus should be on the ok button', SugarDocument.getDocument(), 'button:contains(OK)');
    Mouse.trueClickOn(SugarDocument.getDocument(), '.tox-dialog');
    await FocusTools.pTryOnSelector('Focus should still be on the ok button', SugarDocument.getDocument(), 'button:contains(OK)');
    await pTeardown();
  });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('Check that clicking ok in the dialog makes the dialog go away', () => {
    createAlert('Showing an alert', Fun.noop);
    Mouse.clickOn(SugarBody.body(), '.tox-button:contains("OK")');
    UiFinder.notExists(SugarBody.body(), '[role="dialog"]');
  });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('TINY-3548: sanitize message', async () => {
    createAlert('<a href="javascript:alert(1)">invalid link</a><script>alert(1)</script><a href="http://tiny.cloud">valid link</a>', Fun.noop);
    const dialogBody = SelectorFind.descendant(SugarDocument.getDocument(), '.tox-dialog__body').getOrDie('Cannot find dialog body element');
    Assertions.assertStructure('A basic alert dialog should have these components',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-dialog__body') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-dialog__body-content') ],
            children: [
              s.element('p', {
                children: [
                  s.element('a', {
                    exactAttrs: { },
                    children: [
                      s.text(str.is('invalid link'))
                    ]
                  }),
                  s.element('a', {
                    exactAttrs: {
                      href: str.is('http://tiny.cloud')
                    },
                    children: [
                      s.text(str.is('valid link'))
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })),
      dialogBody
    );
    await pTeardown();
  });

  it('TINY-13812: Alert dialog should have alertdialog role', async () => {
    createAlert('Alert dialog accessibility test', Fun.noop);
    await pWaitForDialog();
    const dialog = UiFinder.findIn<HTMLElement>(SugarBody.body(), '.tox-dialog').getOrDie();
    assert.equal(Attribute.get(dialog, 'role'), 'alertdialog', 'Alert dialog should have role="alertdialog"');
    await pTeardown();
  });

  it('TINY-13812: Alert dialog should not have aria-label nor aria-labelledby attributes', async () => {
    createAlert('Alert dialog accessibility test', Fun.noop);
    await pWaitForDialog();
    const dialog = UiFinder.findIn<HTMLElement>(SugarBody.body(), '.tox-dialog').getOrDie();
    assert.isFalse(Attribute.has(dialog, 'aria-label'), 'Alert dialog should not have aria-label attribute');
    assert.isFalse(Attribute.has(dialog, 'aria-labelledby'), 'Alert dialog should not have aria-labelledby attribute');
    await pTeardown();
  });

  it('TINY-13812: Alert dialog should have aria-describedby correctly setup', async () => {
    const alertDialogText = 'Alert dialog accessibility test';
    createAlert(alertDialogText, Fun.noop);
    await pWaitForDialog();
    const dialog = UiFinder.findIn<HTMLElement>(SugarBody.body(), '.tox-dialog').getOrDie();

    assert.isTrue(Attribute.has(dialog, 'aria-describedby'), 'Alert dialog should have aria-describedby attribute');

    const describedById = Attribute.get(dialog, 'aria-describedby');
    const description = UiFinder.findIn<HTMLElement>(SugarBody.body(), '#' + describedById).getOrDie();
    assert.equal(TextContent.get(description), alertDialogText, 'aria-describedby should reference the dialog body');

    await pTeardown();
  });
});
