import { ApproxStructure, Assertions, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('phantom.tinymce.themes.silver.window.WindowManagerTest', () => {
  const helpers = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  let windowManagerWithDragging: WindowManagerImpl;
  before(() => {
    windowManager = WindowManager.setup(helpers.extras());
    windowManagerWithDragging = WindowManager.setup({
      editor: helpers.extras().editor,
      backstage: {
        ...helpers.extras().backstage,
        dialog: {
          isDraggableModal: Fun.always
        }
      }
    });
  });

  const assertShouldFail = (conf: any, asserter: (err: Error) => void) => {
    try {
      windowManager.open(conf, {}, Fun.noop);
      assert.fail('This should throw a configuration error');
    } catch (err) {
      asserter(err);
    }
  };

  const setupDialogWithoutDragging = (conf: Dialog.DialogSpec<any>) => {
    windowManager.open(conf, {}, Fun.noop);
  };

  const setupDialogWithDragging = (conf: Dialog.DialogSpec<any>) => {
    windowManagerWithDragging.open(conf, {}, Fun.noop);
  };

  const pTeardown = async () => {
    Mouse.clickOn(SugarBody.body(), '.tox-button--icon[aria-label="Close"]');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
  };

  const assertSinkStructure = (asserter: (sink: SugarElement<HTMLElement>) => void) => {
    const sink = helpers.sink();
    asserter(sink);
  };

  const pTest = async (conf: Dialog.DialogSpec<any>, asserter: (sink: SugarElement<HTMLElement>) => void, drag: boolean = false) => {
    await Waiter.pTryUntil(
      'Waiting for any other dialogs to disappear',
      () => UiFinder.notExists(SugarBody.body(), '.tox-button--icon[aria-label="Close"]')
    );
    const setup = drag ? setupDialogWithDragging : setupDialogWithoutDragging;
    setup(conf);
    await UiFinder.pWaitFor('Waiting for dialog to appear', SugarBody.body(), '.tox-button--icon[aria-label="Close"]');
    assertSinkStructure(asserter);
    await pTeardown();
  };

  it('The body type should return a useful error', () => assertShouldFail({
    title: 'test-wrong-body',
    body: {
      type: 'foo'
    },
    buttons: []
  }, (err) => {
    const message = err.message.split('\n');
    assert.equal('Failed path: (dialog > body)', message[1], 'This should throw a configuration error: showing the exact failure');
    assert.equal('The chosen schema: "foo" did not exist in branches: {', message[2], 'This should throw a configuration error: showing the exact failure');
  }));

  it('body panel is missing items: []', () => assertShouldFail({
    title: 'test-missing-panel',
    body: {
      type: 'panel'
      /* items: []*/ // I need items: [] to work, thats what this test should complain about
    },
    buttons: []
  }, (err) => {
    const message = err.message.split('\n');
    assert.equal('Failed path: (dialog > body > branch: panel)', message[1], 'This should throw a configuration error: showing the exact failure');
    assert.equal('Could not find valid *required* value for "items" in {', message[2], 'This should throw a configuration error: showing the exact failure');
  }));

  it('The smallest config to get draggable dialog working, it should have this DOM structure', () => pTest({
    title: 'test-min-required-with-dragging',
    body: {
      type: 'panel',
      items: []
    },
    buttons: []
  }, (sink) => {
    Assertions.assertStructure('A basic dialog should have these components',
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
                    children: [
                      s.element('div', { classes: [ arr.has('tox-dialog__title') ] }),
                      s.element('div', { classes: [ arr.has('tox-dialog__draghandle') ] }),
                      s.element('button', { classes: [ arr.has('tox-button') ] })
                    ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-dialog__content-js') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-dialog__body') ],
                        children: [
                          s.element('div', {
                            // Potentially reinstate once we have the structure 100% defined.
                            // attrs: {
                            //   role: str.is('presentation')
                            // }
                          })
                        ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-dialog__footer') ]
                  })
                ]
              })
            ]
          })
        ]
      })),
      sink
    );
  }, true));

  it('The smallest config to get non-draggable dialog working, it should have this DOM structure', () => pTest({
    title: 'test-min-required-without-dragging',
    body: {
      type: 'panel',
      items: []
    },
    buttons: []
  }, (sink) => {
    Assertions.assertStructure('A basic dialog should have these components',
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
                    children: [
                      s.element('div', { classes: [ arr.has('tox-dialog__title') ] }),
                      s.element('button', { classes: [ arr.has('tox-button') ] })
                    ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-dialog__content-js') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-dialog__body') ],
                        children: [
                          s.element('div', {
                            // Potentially reinstate once we have the structure 100% defined.
                            // attrs: {
                            //   role: str.is('presentation')
                            // }
                          })
                        ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-dialog__footer') ]
                  })
                ]
              })
            ]
          })
        ]
      })),
      sink
    );
  }, false));

  it('Initial Data test', async () => {
    const conf: Dialog.DialogSpec<any> = {
      title: 'test',
      body: {
        type: 'panel',
        items: [
          {
            name: 'fooname',
            type: 'input',
            label: 'Foo Label'
          }
        ]
      },
      buttons: [],
      initialData: {
        fooname: 'hello world'
      }
    };

    const instanceApi = windowManager.open(conf, {}, Fun.noop);
    const dialogBody = SelectorFind.descendant(SugarBody.body(), '.tox-dialog__body').getOrDie('Cannot find dialog body');

    Assertions.assertStructure('It should load with form components in the dom structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-dialog__body') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-dialog__body-content') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-form') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-form__group') ],
                    children: [
                      s.element('label', {
                        classes: [ arr.has('tox-label') ],
                        attrs: {
                          for: str.startsWith('form-field_')
                        },
                        html: str.is('Foo Label')
                      }),
                      s.element('input', {
                        classes: [ arr.has('tox-textfield') ],
                        attrs: {
                          type: str.is('text')
                        }
                      })
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

    const inputElement: HTMLInputElement = document.querySelector('input.tox-textfield');
    assert.equal(inputElement.value, conf.initialData.fooname, 'The input value should equal the initial data');

    const nuData = { fooname: 'Bonjour Universe' };
    instanceApi.setData(nuData);
    assert.deepEqual(instanceApi.getData(), nuData, 'Calling setData, should update the data');

    const badData = { fooname: [ 'not right' ] };

    try {
      instanceApi.setData(badData);
    } catch (error) {
      const message = error.message.split('\n');
      assert.equal('Failed path: (data > fooname)', message[1], 'Calling setData, with invalid data should throw: ');
      assert.equal('Expected type: string but got: object', message[2], 'Calling setData, with invalid data should throw: ');
    }
    assert.deepEqual(instanceApi.getData(), nuData, 'Calling setData, with invalid data, should not change the data, it should remain the same');
    await pTeardown();
  });
});
