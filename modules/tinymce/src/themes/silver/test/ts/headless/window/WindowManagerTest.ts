import { ApproxStructure, Assertions, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowManagerImpl, WindowParams } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.window.WindowManagerTest', () => {
  const extrasHook = TestExtras.bddSetup();
  let windowManagerWithoutDragging: WindowManagerImpl;
  let windowManagerWithDragging: WindowManagerImpl;
  before(() => {
    const testExtras = extrasHook.access().extras;
    windowManagerWithoutDragging = WindowManager.setup(testExtras);
    windowManagerWithDragging = WindowManager.setup({
      editor: testExtras.editor,
      backstages: {
        popup: {
          ...testExtras.backstages.popup,
          dialog: {
            isDraggableModal: Fun.always
          }
        },
        dialog: {
          ...testExtras.backstages.dialog,
          dialog: {
            isDraggableModal: Fun.always
          }
        }
      }
    });
  });

  const assertShouldFail = (conf: any, asserter: (err: Error) => void) => {
    try {
      windowManagerWithoutDragging.open(conf, {}, Fun.noop);
      assert.fail('This should throw a configuration error');
    } catch (err: any) {
      asserter(err);
    }
  };

  const setupDialogWithoutDragging = (conf: Dialog.DialogSpec<any>, params: WindowParams) => {
    windowManagerWithoutDragging.open(conf, params, Fun.noop);
  };

  const setupDialogWithDragging = (conf: Dialog.DialogSpec<any>, params: WindowParams) => {
    windowManagerWithDragging.open(conf, params, Fun.noop);
  };

  const pTeardown = async () => {
    Mouse.clickOn(SugarBody.body(), '.tox-button--icon[aria-label="Close"]');
    await Waiter.pTryUntil(
      'Waiting for blocker to disappear after clicking close',
      () => UiFinder.notExists(SugarBody.body(), '.tox-dialog-wrap')
    );
  };

  const pTest = async (
    scenario: {
      conf: Dialog.DialogSpec<any>;
      params: WindowParams;
      getSink: () => SugarElement<HTMLElement>;
      expectedStructure: StructAssert;
      hasDrag: boolean;
    }
  ) => {
    await Waiter.pTryUntil(
      'Waiting for any other dialogs to disappear',
      () => UiFinder.notExists(SugarBody.body(), '.tox-button--icon[aria-label="Close"]')
    );
    const setup = scenario.hasDrag ? setupDialogWithDragging : setupDialogWithoutDragging;
    setup(scenario.conf, scenario.params);
    const sink = scenario.getSink();
    await UiFinder.pWaitFor(
      'Waiting for dialog to appear',
      scenario.getSink(),
      '.tox-button--icon[aria-label="Close"]'
    );
    Assertions.assertStructure(
      `Checking contents of sink`,
      scenario.expectedStructure,
      sink
    );
    await pTeardown();
  };

  it('The body type should return a useful error', () => assertShouldFail(
    {
      title: 'test-wrong-body',
      body: {
        type: 'foo'
      },
      buttons: []
    },
    (err) => {
      const message = err.message.split('\n');
      assert.equal('Failed path: (dialog > body)', message[1], 'This should throw a configuration error: showing the exact failure');
      assert.equal('The chosen schema: "foo" did not exist in branches: {', message[2], 'This should throw a configuration error: showing the exact failure');
    }
  ));

  it('body panel is missing items: []', () => assertShouldFail(
    {
      title: 'test-missing-panel',
      body: {
        type: 'panel'
        /* items: []*/ // I need items: [] to work, thats what this test should complain about
      },
      buttons: []
    },
    (err) => {
      const message = err.message.split('\n');
      assert.equal('Failed path: (dialog > body > branch: panel)', message[1], 'This should throw a configuration error: showing the exact failure');
      assert.equal('Could not find valid *required* value for "items" in {', message[2], 'This should throw a configuration error: showing the exact failure');
    }
  ));

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

    const instanceApi = windowManagerWithoutDragging.open(conf, {}, Fun.noop);
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

    const inputElement = document.querySelector('input.tox-textfield') as HTMLInputElement;
    assert.equal(inputElement.value, conf.initialData?.fooname, 'The input value should equal the initial data');

    const nuData = { fooname: 'Bonjour Universe' };
    instanceApi.setData(nuData);
    assert.deepEqual(instanceApi.getData(), nuData, 'Calling setData, should update the data');

    const badData = { fooname: [ 'not right' ] };

    try {
      instanceApi.setData(badData);
    } catch (error: any) {
      const message = error.message.split('\n');
      assert.equal('Failed path: (data > fooname)', message[1], 'Calling setData, with invalid data should throw: ');
      assert.equal('Expected type: string but got: object', message[2], 'Calling setData, with invalid data should throw: ');
    }
    assert.deepEqual(instanceApi.getData(), nuData, 'Calling setData, with invalid data, should not change the data, it should remain the same');
    await pTeardown();
  });

  context('Structures for different configurations', () => {
    context('Setting draghandles (for modals)', () => {
      // The draghandles are not created by the window spec, but instead the WindowManager
      // instance. So we need to use different WindowManager instances depending on whether
      // or not we are supporting draggable modals.
      const mkWindowSpec = (hasDrag: boolean): Dialog.DialogSpec<any> => ({
        title: `test-min-required-${hasDrag ? 'with' : 'without'}-dragging`,
        body: {
          type: 'panel',
          items: []
        },
        // TINY-9996: buttons must be non-empty array for footer to be rendered
        buttons: [
          {
            type: 'cancel',
            name: 'cancel',
            text: 'Cancel'
          }
        ]
      });

      const structHeaderWithDrag = ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-dialog__header') ],
          children: [
            s.element('div', { classes: [ arr.has('tox-dialog__title') ] }),
            s.element('div', { classes: [ arr.has('tox-dialog__draghandle') ] }),
            s.element('button', { classes: [ arr.has('tox-button') ] })
          ]
        });
      });

      const structHeaderWithoutDrag = ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-dialog__header') ],
          children: [
            s.element('div', { classes: [ arr.has('tox-dialog__title') ] }),
            s.element('button', { classes: [ arr.has('tox-button') ] })
          ]
        });
      });

      const buildInnerStruct = (structs: { headers: StructAssert[] }) => ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-dialog') ],
        children: [
          ...structs.headers,
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
      }));

      // Inline mode *always* has the drag handle. The setting only applies to modal
      // dialogs.
      const buildInlineStructure = () => ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('mce-silver-sink') ],
          children: [
            s.element('div', {
              attrs: {
                'data-alloy-placement': str.startsWith('')
              },
              children: [
                buildInnerStruct({
                  // Inline dialogs always have drag handles
                  headers: [
                    structHeaderWithDrag
                  ]
                })
              ]
            })
          ]
        });
      });

      const buildModalStructure = (structHeader: StructAssert) => {
        return ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('mce-silver-sink') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-dialog-wrap') ],
                children: [
                  s.element('div', { classes: [ arr.has('tox-dialog-wrap__backdrop') ] }),
                  buildInnerStruct({
                    headers: [
                      structHeader
                    ]
                  })
                ]
              })
            ]
          });
        });
      };

      context('draggable_modal = false', () => {
        const hasDrag = false;
        const windowSpec = mkWindowSpec(hasDrag);

        context('inline', () => {
          // Inline mode *always* has the drag handle. The setting only applies to modal
          // dialogs.
          const expectedStructure = buildInlineStructure();

          it('inline: toolbar', () => pTest({
            conf: windowSpec,
            params: { inline: 'toolbar' },
            getSink: extrasHook.access().getPopupSink,
            expectedStructure,
            hasDrag
          }));

          it('inline: cursor', () => pTest({
            conf: windowSpec,
            params: { inline: 'cursor' },
            getSink: extrasHook.access().getPopupSink,
            expectedStructure,
            hasDrag
          }));
        });

        it('modal dialog', async () => {
          const expectedStructure = buildModalStructure(
            structHeaderWithoutDrag
          );

          await pTest({
            conf: windowSpec,
            params: { },
            getSink: extrasHook.access().getDialogSink,
            expectedStructure,
            hasDrag
          });
        });
      });

      context('draggable_modal = true', () => {
        const hasDrag = true;
        const windowSpec = mkWindowSpec(hasDrag);

        context('inline', () => {
          const expectedStructure = buildInlineStructure();

          it('inline: toolbar', () => pTest({
            conf: windowSpec,
            params: { inline: 'toolbar' },
            getSink: extrasHook.access().getPopupSink,
            expectedStructure,
            hasDrag
          }));

          it('inline: cursor', () => pTest({
            conf: windowSpec,
            params: { inline: 'cursor' },
            getSink: extrasHook.access().getPopupSink,
            expectedStructure,
            hasDrag
          }));
        });

        it('modal dialog', async () => {
          const expectedStructure = buildModalStructure(
            structHeaderWithDrag
          );

          await pTest({
            conf: windowSpec,
            params: { },
            getSink: extrasHook.access().getDialogSink,
            expectedStructure,
            hasDrag
          });
        });
      });
    });
  });
});
