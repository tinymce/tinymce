import { ApproxStructure, Assertions, FocusTools, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, SelectorFind, SugarBody, SugarDocument, TextContent } from '@ephox/sugar';
import { assert } from 'chai';

import type { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.window.WindowManagerConfirmTest', () => {
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

  const createConfirm = (message: string, callback: (state: boolean) => void) => {
    windowManager.confirm(message, callback);
  };

  const pWaitForDialog = () => Waiter.pTryUntil(
    'confirm dialog shows',
    () => UiFinder.exists(SugarBody.body(), '.tox-dialog__body')
  );

  // TODO TINY-10480: Investigate flaky tests
  it.skip('Check the basic structure of the confirm dialog', async () => {
    createConfirm('The confirm dialog loads with the basic structure', Fun.noop);
    await pWaitForDialog();
    const sink = extrasHook.access().getDialogSink();
    Assertions.assertStructure('A basic confirm dialog should have these components',
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
                            html: str.is('No'),
                            classes: [
                              arr.has('tox-button'),
                              arr.has('tox-button--secondary')
                            ],
                            attrs: {
                              'type': str.is('button'),
                              'data-alloy-tabstop': str.is('true')
                            }
                          }),
                          s.element('button', {
                            html: str.is('Yes'),
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
    createConfirm(label, Fun.noop);
    const dialogBody = SelectorFind.descendant(SugarDocument.getDocument(), '.tox-dialog__body').getOrDie('Cannot find dialog body element');
    Assertions.assertStructure('A basic confirm dialog should have these components',
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
  it.skip('The callback should fire when close is invoked', async () => {
    let calls = 0;
    const testCallback = () => {
      calls++;
    };
    windowManager.confirm('confirm', testCallback);
    assert.equal(calls, 0, 'callback should not have been called yet');
    Mouse.clickOn(SugarBody.body(), '.tox-button--icon[aria-label="Close"]');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
    assert.equal(calls, 1, 'Clicking on close should call the callback fn once');
  });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('Should focus on the yes button initially', async () => {
    createConfirm('initial focus should be on the yes button', Fun.noop);
    await FocusTools.pTryOnSelector('When the confirm dialog loads, focus should be on the yes button', SugarDocument.getDocument(), 'button:contains(Yes)');
    await pTeardown();
  });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('Should focus the first button when the dialog is clicked', async () => {
    createConfirm('Click should focus the yes button', Fun.noop);
    await FocusTools.pTryOnSelector('When the confirm dialog loads, focus should be on the yes button', SugarDocument.getDocument(), 'button:contains(Yes)');
    Mouse.trueClickOn(SugarDocument.getDocument(), '.tox-dialog');
    await FocusTools.pTryOnSelector('Focus should be on the first button (no)', SugarDocument.getDocument(), 'button:contains(No)');
    await pTeardown();
  });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('Check that clicking close in the dialog makes the dialog go away', () => {
    createConfirm('Showing an confirm', Fun.noop);
    Mouse.clickOn(SugarBody.body(), '.tox-button:contains("Yes")');
    UiFinder.notExists(SugarBody.body(), '[role="dialog"]');
  });

  // TODO TINY-10480: Investigate flaky tests
  it.skip('TINY-3548: sanitize message', async () => {
    createConfirm('<a href="javascript:alert(1)">invalid link</a><script>alert(1)</script><a href="http://tiny.cloud">valid link</a>', Fun.noop);
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

  it('TINY-13812: Confirm dialog should have alertdialog role', async () => {
    createConfirm('Confirm dialog accessibility test', Fun.noop);
    await pWaitForDialog();
    const dialog = UiFinder.findIn<HTMLElement>(SugarBody.body(), '.tox-dialog').getOrDie();
    assert.equal(Attribute.get(dialog, 'role'), 'alertdialog', 'Confirm dialog should have role="alertdialog"');
    await pTeardown();
  });

  it('TINY-13812: Confirm dialog should not have aria-label nor aria-labelledby attributes', async () => {
    createConfirm('Confirm dialog accessibility test', Fun.noop);
    await pWaitForDialog();
    const dialog = UiFinder.findIn<HTMLElement>(SugarBody.body(), '.tox-dialog').getOrDie();
    assert.isFalse(Attribute.has(dialog, 'aria-label'), 'Confirm dialog should not have aria-label attribute');
    assert.isFalse(Attribute.has(dialog, 'aria-labelledby'), 'Confirm dialog should not have aria-labelledby attribute');
    await pTeardown();
  });

  it('TINY-13812: Confirm dialog should have aria-describedby correctly setup', async () => {
    const confirmDialogText = 'Confirm dialog accessibility test';
    createConfirm(confirmDialogText, Fun.noop);
    await pWaitForDialog();
    const dialog = UiFinder.findIn<HTMLElement>(SugarBody.body(), '.tox-dialog').getOrDie();

    assert.isTrue(Attribute.has(dialog, 'aria-describedby'), 'Confirm dialog should have aria-describedby attribute');

    const describedById = Attribute.get(dialog, 'aria-describedby');
    const description = UiFinder.findIn<HTMLElement>(SugarBody.body(), '#' + describedById).getOrDie();
    assert.equal(TextContent.get(description), confirmDialogText, 'aria-describedby should reference the dialog body');

    await pTeardown();
  });
});
