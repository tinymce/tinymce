import { ApproxStructure, Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Types } from '@ephox/bridge';
import { document, HTMLInputElement } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { Body, Element as SugarElement } from '@ephox/sugar';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:configurations Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);
  const windowManagerWithDragging = WindowManager.setup({
    editor: helpers.extras.editor,
    backstage: {
      ...helpers.extras.backstage,
      dialog: {
        isDraggableModal: () => true
      }
    }
  });

  const shouldFail = (label: string, conf, asserter: (err: Error) => void) => Step.async(function (next, die) {
    try {
      windowManager.open(conf, {}, Fun.noop);
    } catch (err) {
      asserter(err);
      return next();
    }

    die('This should throw a configuration error: ' + label);
  });

  const sSetupDialogWithoutDragging = (conf) => Step.sync(() => {
    windowManager.open(conf, {}, Fun.noop);
  });

  const sSetupDialogWithDragging = (conf) => Step.sync(() => {
    windowManagerWithDragging.open(conf, {}, Fun.noop);
  });

  const sTeardown = GeneralSteps.sequence([
    Mouse.sClickOn(Body.body(), '.tox-button--icon[aria-label="Close"]'),
    Waiter.sTryUntil(
      'Waiting for blocker to disappear after clicking close',
      UiFinder.sNotExists(Body.body(), '.tox-dialog-wrap')
    )
  ]);

  const sAssertSinkStructure = (asserter) => Chain.asStep(Body.body(), [
    UiFinder.cWaitFor('Looking for sink', '.mce-silver-sink'),
    Chain.op(asserter)
  ]);

  const createTest = (label, conf, asserter, drag?) => Logger.t(
    label,
    GeneralSteps.sequence([
      Waiter.sTryUntil(
        'Waiting for any other dialogs to disappear',
        UiFinder.sNotExists(Body.body(), '.tox-button--icon[aria-label="Close"]')
      ),
      drag ? sSetupDialogWithDragging(conf) : sSetupDialogWithoutDragging(conf),
      UiFinder.sWaitFor('Waiting for dialog to appear', Body.body(), '.tox-button--icon[aria-label="Close"]'),
      sAssertSinkStructure(asserter),
      sTeardown
    ])
  );

  const sTestWrongBodyType = shouldFail('The body type should return a useful error', {
    title: 'test-wrong-body',
    body: {
      type: 'foo'
    },
    buttons: []
  }, (err) => {
    const message = err.message.split('\n');
    Assertions.assertEq('This should throw a configuration error: showing the exact failure', message[1], 'Failed path: (dialog > body)');
    Assertions.assertEq('This should throw a configuration error: showing the exact failure', message[2], 'The chosen schema: "foo" did not exist in branches: {');
  });

  const sTestMissingPanelItems = shouldFail('body panel is missing items: []', {
    title: 'test-missing-panel',
    body: {
      type: 'panel'
      /* items: []*/ // I need items: [] to work, thats what this test should complain about
    },
    buttons: []
  }, (err) => {
    const message = err.message.split('\n');
    Assertions.assertEq('This should throw a configuration error: showing the exact failure', message[1], 'Failed path: (dialog > body > branch: panel)');
    Assertions.assertEq('This should throw a configuration error: showing the exact failure', message[2], 'Could not find valid *strict* value for "items" in {');
  });

  const sTestMinRequiredConfigWithDragging = createTest('The smallest config to get draggable dialog working, it should have this DOM structure', {
    title: 'test-min-required-with-dragging',
    body: {
      type: 'panel',
      items: []
    },
    buttons: []
  }, (rootElement: SugarElement) => {

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
      rootElement
    );
  }, true);

  const sTestMinRequiredConfigWithoutDragging = createTest('The smallest config to get non-draggable dialog working, it should have this DOM structure', {
    title: 'test-min-required-without-dragging',
    body: {
      type: 'panel',
      items: []
    },
    buttons: []
  }, (rootElement: SugarElement) => {

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
      rootElement
    );
  }, false);

  const sWindowDataTest = Logger.t(
    'Initial Data test',
    GeneralSteps.sequence([
      Step.sync(function () {
        const conf: Types.Dialog.DialogApi<any> = {
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
        const dialogBody = SugarElement.fromDom(document.querySelector('.tox-dialog__body'));

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
                              for: str.startsWith( 'form-field_' )
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
        Assertions.assertEq('The input value should equal the initial data', conf.initialData.fooname, inputElement.value);

        const nuData = { fooname: 'Bonjour Universe' };
        instanceApi.setData(nuData);
        Assertions.assertEq('Calling setData, should update the data', nuData, instanceApi.getData());

        const badData = { fooname: [ 'not right' ] };

        try {
          instanceApi.setData(badData);
        } catch (error) {
          const message = error.message.split('\n');
          Assertions.assertEq('Calling setData, with invalid data should throw: ', message[1], 'Failed path: (data > fooname)');
          Assertions.assertEq('Calling setData, with invalid data should throw: ', message[2], 'Expected type: string but got: object');
        }
        Assertions.assertEq('Calling setData, with invalid data, should not change the data, it should remain the same', nuData, instanceApi.getData());

      }),
      sTeardown
    ])
  );

  Pipeline.async({}, [
    sTestWrongBodyType,
    sTestMissingPanelItems,
    sTestMinRequiredConfigWithDragging,
    sTestMinRequiredConfigWithoutDragging,
    sWindowDataTest

  ], function () {
    helpers.destroy();
    success();
  }, failure);
});
